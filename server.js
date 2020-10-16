const express = require('express'),
      app = express(),
      ws = require('ws'),
      http = require('http'),
      { PeerServer } = require('peer')

app.use(express.static('public'));

const server = http.createServer( app );

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html")
});


// database connection
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const uri = `mongodb+srv://dbUsername:${process.env.DBPASSWORD}@cluster0.f6ydg.mongodb.net/<dbname>?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true,  useUnifiedTopology: true });
let collection = null;
client.connect(err => {
  collection = client.db("group8db").collection("accounts");
});

const bodyparser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;

var rooms = [];
const clients = [];
const socketServer = new ws.Server({ server });




socketServer.on('connection', connClient => {
  //when the server gets a message from this client
  connClient.on('message', msg => {
    //get room client is trying to join
    
    
    
  //   //send message to every client EXCEPT this one
  //   clients.forEach(c => {
  //     if(c !== connClient){
  //       c.send( msg )
  //     }
  //   });
  });
  
  //add client to client list
  clients.push(connClient);
});



passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    },
    function (email, password, done) {
        collection.find({ email: email, password: password }).toArray()
        .then(function (result) {
            if (result.length >= 1) {
                return done(null, email);
            } else {
                return done(null, false, { message: "Incorrect username or password" });
            }
        });
    }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
app.use(passport.initialize());

app.post("/register", bodyparser.json(), function (request, response) {
    collection.find({ email: request.body.email }).toArray()
        .then(function (result) {
            if (result.length == 0) {
                collection.insertOne(request.body)
                  .then(() => response.sendStatus(200));
            } else {
              response.sendStatus(420);
            }
        });
});

app.post('/login', bodyparser.json(),
    passport.authenticate('local', {failureFlash: false}), function(request, response) {
      response.json({email: request.user});
    }
);

//create a room, and enter a new list of usernames as an entry in rooms
app.post('/createRoom', bodyparser.json(), function(request, response) {
  var username = request.body.username;
  var roomId = request.body.roomId;
  
  if(!rooms[roomId])
  {
      rooms[roomId] = [];
      rooms[roomId].push(username);
      console.log("User "+username+" has created a room with ID: "+roomId);
      response.json(rooms[roomId]);
  }else{
    response.sendStatus(403).send(JSON.stringify({error: "Room ID already in use. Please try another Room ID."}))
  }
});

//join a room, if it exists, and return a list of all of the users in this room
app.post('/joinRoom', bodyparser.json(), function(request, response) {
  var username = request.body.username;
  var roomId = request.body.roomId;
  
  if(!rooms[roomId])
  {
      response.sendStatus(404).send(JSON.stringify({error: 'The specified room was not found. Please choose another Room ID.'}))
  }else{
    if(!rooms[roomId].includes(username))
    {
      rooms[roomId].push(username);
      response.json(rooms[roomId]);
      console.log("User "+username+" has joined Room "+roomId);
    }else{
      response.sendStatus(403).send(JSON.stringify({error: 'You cannot join a room you are already in.'}))
    }
  }
});

app.listen(3000);
 