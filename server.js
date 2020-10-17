require("dotenv").config();  // For .env variables, check the Google Drive.
const express = require("express");
const path = require("path");

const app = express();

const ws = require('ws');
const http = require ('http');

const MongoDB = require('mongodb');
const MongoClient = MongoDB.MongoClient;
const uri = `mongodb+srv://${ process.env.DBUSER }:${ process.env.DBPASS }@${ process.env.DBHOST }/${ process.env.DBNAME }?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true });
let collection = null;
client.connect(err => {
  collection = client.db("test").collection("devices");
  console.log(collection);
});

app.use(express.static("bubble/dist/bubble"));
const server = http.createServer( app );
const socketServer = new ws.Server({ server });
const bodyParser = require('body-parser');

//////////////
// Passport //
//////////////

const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const auth = require('connect-ensure-login');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
},
function(accessToken, refreshToken, profile, cb) {
  // User.findOrCreate({ githubId: profile.id }, function (err, user) {
  //   return cb(err, user);
  // });
  return cb(null, profile);
}
));

app.get('/auth/github', 
  passport.authenticate('github', { successReturnToOrRedirect: '/', failureRedirect: '/', failureFlash: 'Authentication Failed'}));

app.get('/return',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

/////////////
// Routing //
/////////////

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/bubble/dist/bubble/index.html");
});

// https://expressjs.com/en/starter/basic-routing.html
app.get("/about", (request, response) => {
  response.sendFile(__dirname + "/bubble/dist/bubble/index.html");
});

//////////////////
// Socket Logic //
//////////////////

let bubbles = [];
let clients = [];
let clientdata = [];
/*
clientdata: { 
  bubble: string,
  client: WebSocket,
  id: string
  // Add more as needed
}[]
*/
let count = 0;
socketServer.on( 'connection', client => {
  // when the server receives a message from this client...
  client.on( 'message', msg => {
	  // send msg to every client EXCEPT
    // the one who originally sent it. in this demo this is
    // used to send p2p offer/answer signals between clients
    for (let c of clients) {
      if( c !== client )
        c.send( msg );
    };
  });

  let otherClientsAlive = 0;
  for(let i = 0; i < clients.length; i++) {
    if (clients[i].readyState === 1){
      otherClientsAlive++;
    }
  }
  console.log(`Other clients alive: ${otherClientsAlive}`); 
  console.log(clients);
  let id = uuidv4();
  // add client to client list
  clients.push( client )
  clientdata.push({
    bubble: '',
    client: client,
    id: id
  });
  
  client.send(
    JSON.stringify({ 
      address:'id',
      body: id
    })
  );
  client.send(
    JSON.stringify({ 
      address:'connect',
      // we only initiate p2p if this is the second client connected
      initiator: otherClientsAlive >= 1
    })
  );
  
});

//////////////
// Requests //
//////////////

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

app.post('/usersInRoom', bodyParser.json(), function addRun (request, response) {
  // console.log(`Got message from user ${request.user.username}`);
  console.log(`Contents of clients before: ${clients}`);
  console.log(`Contents of clientdata: ${clientdata}`);
  let data = {
    id: null,
    listOfClients: [],
    listOfIDs: []
  }
  for( let i = 0; i < clientdata.length; i++) {
    if (request.body.id === clientdata[i].id) {
      clientdata[i].bubble = request.body.bubbleName;
    } 
  }
  for( let i = 0; i < clientdata.length; i++) {
    if (clientdata[i].bubble === request.body.bubbleName
      && request.body.id !== clientdata[i].id) {
      data.listOfClients.push(clientdata[i].client);
      data.listOfIDs.push(clientdata[i].id);
    } 
  }
  console.log(`Contents of clientdata after: ${clients}`);
  console.log(clients);
  response.json(data);
  
});

app.post('/getClientInfo', bodyParser.json(), function addRun (request, response) {
  // console.log(`Got message from user ${request.user.username}`);
  let data = {
    id: null,
    listOfClients: []
  }
  if (request.body.needsId) {
    data.id = uuidv4();
  }
  for( let i = 0; i < clientdata.length; i++) {
    if (clientdata[i].bubble === request.body.bubbleName) {
      listOfClients.push(clientdata[i].client);
    } 
  }
  response.json(data);
  
});



////////////
// Listen //
////////////

// listen for requests :)
const listener = server.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});