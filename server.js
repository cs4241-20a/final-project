// server.js
// where your node app starts'

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const fetch = require("node-fetch")
const compression = require("compression")
const cookieSession = require("cookie-session")
const app = express();
const bodyparse = require('body-parser')
require('dotenv').config()

// middleware #1 - // make all the files in 'public' available
app.use(express.static("public"));
// middleware #2 - cookie session
app.use(cookieSession({
  secret: process.env.COOKIE_SECRET
}))

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;

const uri = `mongodb+srv://admin:a3-admin-password@a3-matt-tolbert.gv63o.mongodb.net/a3?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true });

let collection = null
client.connect(err => {
  collection = client.db("a3").collection("database");
});

// middleware #3 - verify mongodb connection
app.use( (req,res,next) => {
  if( collection !== null ) {
    next()
  }else{
    res.status( 503 ).send()
  }
})

// middleware #4 - convert body to json using bodyparser (consolidates parsing of body for add/modify/delete)
app.use(bodyparse.json())

// middleware #5 - use compression
app.use(compression({ filter: shouldCompress }))

function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }

  // fallback to standard filter function
  return compression.filter(req, res)
}

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  // check if user logged in
  if(request.session.userID) {
    //console.log("Authenticated user found")
    response.sendFile(__dirname + "/views/home.html")
  }
  else {
    //console.log("No authenticated user found")
    response.sendFile(__dirname + "/views/login.html");
  }
});


/* 
Handle OAuth with GitHub - Tutorial from Kevin Simper @ 
https://www.kevinsimper.dk/posts/how-to-make-authentication-with-github-apps-for-side-projects 
*/
const clientID = '78a1d3d8b280e8c9cd48'
const clientSecret = '876062c9d6411279a48c624b6b103d4c72213544'

app.get('/login', (req, res) => {
  const path = req.protocol + '://' + req.get('host');
  const url = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${path}/login/github/callback`;
  res.json(url);
})

// get access token from github oauth
async function getAccessToken(code, client_id, client_secret) {
  const request = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id,
      client_secret,
      code,
    }),
  })
  const text = await request.text();
  const params = new URLSearchParams(text);
  return params.get("access_token");
}

// get users profile from GitHub API
async function fetchGitHubUser(token) {
  const request = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: 'token ' + token,
    },
  })
  return await request.json()
}

app.get('/login/github/callback', async (req, res) => {
  const code = req.query.code
  const access_token = await getAccessToken(code, clientID, clientSecret)
  const user = await fetchGitHubUser(access_token)
  if(user) {
    console.log("user logged in as " + user.id)
    req.session.userID = user.id;
    res.redirect("/")
  }
  else {
    // reload the page
    console.log("Could not login user")
    res.redirect("/login.html")
  }
})

// logout user
app.get('/logout', (req, res) => {
  if (req.session) req.session = null
  res.redirect('/')
})


/*
Data Management endpoints
*/
app.get('/golfbag', (req, res) => {
  var userData = [];
  collection.find({"userID": req.session.userID}).toArray().then( result => res.json( result ) )
})

app.post('/add', (req, res) => {
  // pull contents from req and insert to DB
  const contents = {
    userID:         req.session.userID,
    manufacturer:   req.body.manufacturer,
    model:          req.body.model,
    type:           req.body.type,
    loft:           req.body.loft,
    distance:       req.body.distance,
    ballSpeed:      req.body.ballSpeed,
    swingSpeed:     req.body.swingSpeed,
  }
  console.log(contents)
  collection.insertOne( contents )
  .then(result => {
    // return entry from DB so that client can keep track of _id
    res.json(result.ops[0])
  })
})

app.post( '/delete', (req, res) => {
  collection
    .deleteOne( { _id:mongodb.ObjectID( req.body._id ) } ) 
    .then(result => res.json(result))
})

app.post( '/update', (req, res) => {
  const json = {
    userID:         req.session.userID,
    manufacturer:   req.body.manufacturer,
    model:          req.body.model,
    type:           req.body.type,
    loft:           req.body.loft,
    distance:       req.body.distance,
    ballSpeed:      req.body.ballSpeed,
    swingSpeed:     req.body.swingSpeed,
  };
  collection
    .updateOne(
      { _id:mongodb.ObjectID( req.body._id ) }, 
      { $set: json }
    )
  .then( result => res.json(result))
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
