// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");

// WebSocket implementation
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: process.env.WS_PORT || 8001 })
// UUID, needed for keeping track of websocket sessions

// const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
// const LocalStrategy = require("passport-local").Strategy;
// const flash = require('connect-flash');
const app = express();
// const mongodb = require('mongodb');
const cookieParser = require("cookie-parser");
const { request } = require("express");
// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(express.json());
app.use(
  require("express-session")({
    secret: "6969",
    saveUninitialized: true,
    resave: true
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

// Keep track of socket client IDs so we can enforce 1 vote per user
let socketClients = []
// Keep track of all messages so people joining late can get them
let messages = []
// Interval to next question
let interval = null;
let started = false; // Has game started?
let phase = null; // Phase of game
let playerVotesBefore = { agree: 0, disagree: 0, unsure: 0 }
let playerVotesAfter = { agree: 0, disagree: 0, unsure: 0 }
// Set initial object to keep track of votes to "before"; at the proper time, this will be changed to "after"
let currentVotingStats = playerVotesBefore

const str_of_debates = ["It's better to pour milk before cereal", "ONE PLUS ONE EQUALS 11", "Hotdogs are tacos",
  "Youtube is better than Netflix", "Brushing your teeth before breakfast is like wiping before pooping",
  "Shorts should be half the price of pants", "Being too cold is WAY better than being too warm",
  "Adam and Eve had no belly buttons", "Boneless wings are overpriced chicken nuggets", "The death penalty should be abolished",
  "Human cloning should be legalized", "All drugs should be legalized", "Juveniles should be tried and treated as adults",
  "Climate change is the greatest threat facing humanity today", "Standardized testing should be abolished",
  "School should be in session year-round", "Homeschooling is better than traditional schooling",
  "Social media has improved human communication"];
let topic = str_of_debates[0];
let categories = ["food", "memes", "politics", "misc"];
const NUMMINUTES = 1;
const SECONDS_BETWEEN_ROUNDS = 5;
const secondsInRound = 60 * NUMMINUTES;

let timeLeft = secondsInRound;


// for now we'll say that the variable below is the database collection for all the votes
//Shouldn't the votes variable just be a local variable that is reset after ever election? instead of database -Mario
let votes;
async function getCategory() {
  const mongodb = require("mongodb");
  const MongoClient = mongodb.MongoClient;
  //const uri = `mongodb+srv://admin:${process.env.DBPASSWORD}@cluster0.vilmh.mongodb.net/<dbname>?retryWrites=true&w=majority`;
  // TODO take the PASSWORD OUT OF THIS URL !!!WARNING!!! AAAAAAHHHH
  const uri = `mongodb+srv://finalProjectUser:Sh2rczjqOQxDlgLc@cluster0.vilmh.mongodb.net/finalproject?retryWrites=true&w=majority`;
  const client = new MongoClient(
    uri,
    { useNewUrlParser: true },
    { useUnifiedTopology: true }
  );
  await client.connect();
  var votes = await client.db("finalproject").collection("topicVotes");
  let allVotes = await votes.find({}).toArray();
  let tallies = [0, 0, 0, 0];
  allVotes.forEach(vote => {
    if (vote.category === "food") {
      tallies[0]++;
    }
    else if (vote.category === "memes") {
      tallies[1]++;
    }
    else if (vote.category === "politics") {
      tallies[2]++;
    }
    else {
      tallies[3]++;
    }
  });
  let highestCategory = 0;
  for (let i = 0; i < tallies.length; i++) {
    if (tallies[i] > tallies[highestCategory]) {
      highestCategory = i;
    }
  }
  //return categories[highestCategory];
  return highestCategory;
}

app.post("/sendVote", async (req, res) => {
  const mongodb = require("mongodb");
  const MongoClient = mongodb.MongoClient;
  //const uri = `mongodb+srv://admin:${process.env.DBPASSWORD}@cluster0.vilmh.mongodb.net/<dbname>?retryWrites=true&w=majority`;
  // TODO take the PASSWORD OUT OF THIS URL !!!WARNING!!! AAAAAAHHHH
  const uri = `mongodb+srv://finalProjectUser:Sh2rczjqOQxDlgLc@cluster0.vilmh.mongodb.net/finalproject?retryWrites=true&w=majority`;
  const client = new MongoClient(
    uri,
    { useNewUrlParser: true },
    { useUnifiedTopology: true }
  );
  await client.connect();
  var votes = await client.db("finalproject").collection("topicVotes");
  let allVotes = await votes.find({}).toArray();
  let user = req.body.user;
  allVotes.forEach(vote => {
    if (user === vote.user) {
      // already voted so quit function
      console.log("already voted for this round");
      return;
    }
  })
  console.log(req.session.username + ' has voted');
  await votes.insertOne(req.body);
  client.close();
})

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  if (request.session.auth === true) {
    response.sendFile(__dirname + "/views/index.html")
  } else {
    response.sendFile(__dirname + "/views/login.html");
  }

});

app.get("/getTopic", (req, res) => {
  //console.log(topic);
  res.json(topic);
});

// Decrement time left and send TICK signal to clients
function tick() {
  timeLeft--;
  sendToClients({
    event: "TICK",
    time: timeLeft
  })
}

async function switchTopic() {
  // Send stats from last round, then start next round after 5 seconds
  sendVotingStats();
  let nextTopic = await getTopic(await getCategory());
  //let nextTopic = getCategory(0);
  while (nextTopic === topic) {
    nextTopic = await getTopic(await getCategory());
  }

  topic = nextTopic;
  console.log(" new topic is ", topic);

  // Reset values and go again!
  timeLeft = secondsInRound;
  messages = []
  playerVotesBefore = { agree: 0, disagree: 0, unsure: 0 }
  playerVotesAfter = { agree: 0, disagree: 0, unsure: 0 }

  setTimeout(() => {
    interval = setInterval(gameLoop, 1000)
    sendToClients({
      event: "NEW_TOPIC"
    })
    clearTopicVotes().then(() => console.log("Removed all topic votes"));

  }, SECONDS_BETWEEN_ROUNDS * 1000)

}

async function clearTopicVotes() {
  const mongodb = require("mongodb");
  const MongoClient = mongodb.MongoClient;
  //const uri = `mongodb+srv://admin:${process.env.DBPASSWORD}@cluster0.vilmh.mongodb.net/<dbname>?retryWrites=true&w=majority`;
  // TODO take the PASSWORD OUT OF THIS URL !!!WARNING!!! AAAAAAHHHH
  const uri = `mongodb+srv://finalProjectUser:Sh2rczjqOQxDlgLc@cluster0.vilmh.mongodb.net/finalproject?retryWrites=true&w=majority`;
  const client = new MongoClient(
    uri,
    { useNewUrlParser: true },
    { useUnifiedTopology: true }
  );
  await client.connect();
  var votes = await client.db("finalproject").collection("topicVotes");
  await votes.deleteMany({});
  client.close();
}

function sendVotingStats() {
  sendToClients({
    event: "VOTE_STATS",
    before: playerVotesBefore,
    after: playerVotesAfter
  })
  
}

// WebSocket stuff
wss.on('connection', (ws) => {
  console.log("New client connected!")

    // Send list of messages to new client on connection
    ws.send(JSON.stringify({
        event: "ALL_MESSAGES",
        messages: messages
    }))

    // For late joining clients, let them know if game underway
    ws.send(JSON.stringify({
      event: "GAME_STARTED",
      value: started,
      phase: phase
    }))

    ws.on('message', (message) => { 
        handleMessage(message, ws)
    })
})

function handleMessage(raw, ws) {
    let msg = JSON.parse(raw);

    if(msg.event === "REGISTER_ME") {
      if(!socketClients.map(i => i.user).includes(msg.id)) {
        socketClients.push({
          user: msg.id,
          socket: ws
        })
        ws.send(JSON.stringify({
          event: "REGISTER_CONFIRM"
        }))
        console.log("Added user ", msg.id)
      }
      
      else {
        ws.send(JSON.stringify({
          event: "REGISTER_FAIL"
        }))
        console.log("Failed to register user ", msg.id)
      }
    }

  if (msg.event === "CHAT_MESSAGE") {
    console.log("Chat message received!")
    messages.push({ user_name: msg.user_name, message: msg.message, score: 0, upVotes: [], downVotes: [] })
    console.log("User %s says: %s", msg.user_name, msg.message)
    sendToClients(msg)
  }
  if (msg.event === "COMMENT_VOTE") {
    console.log(msg);
    // Only let a user vote once per comment
    //TODO: i think this makes it so that only one user can vote on a comment
    if(tryCommentVote(msg)) {
      sendToClients({
        event: "COMMENT_VOTE",
        msgNumber: msg.msgNumber,
        score: messages[msg.msgNumber].score
      })
    }
  }
  if (msg.event === "START") {
    if (interval === null) {
      sendStart();
      interval = setInterval(gameLoop, 1000)
    }
  }
  if (msg.event === "VOTE") {
    if (msg.vote === "A") {
      currentVotingStats.agree++;
    }
    else if (msg.vote === "D") {
      currentVotingStats.disagree++;
    }
    else {
      currentVotingStats.unsure++;
    }

    console.log(playerVotesBefore)
    console.log(playerVotesAfter)
  }
}


// When started...
// -- Set time to default num minutes
// -- Allow pre-voting for 20 seconds
// -- After 20 seconds, start counting down from num minutes
// -- When timer hits 0, ask for post-voting for 20 seconds
// -- After post-voting, display stats and let players vote on next round for 20 seconds.
// -- Repeat!

// Called every second.
function gameLoop() {
  started = true;
  phase = "INITIAL"

  // If no time left, reset.
  if (timeLeft === 0) {
    clearInterval(interval)
    switchTopic();
    // Don't tick if we're at 0
    return;
  }
  // If the round has just started, send STARTING message and get initial votes from players
  if (timeLeft === secondsInRound) {
    sendStart();
    currentVotingStats = playerVotesBefore
    enableChat(false)
    getPlayerVotes("INITIAL");
  }
  // At 14/15 of the way through (4:40 seconds if time is 5 mins), get final votes from players
  else if (timeLeft === secondsInRound / 15) {
    phase = "FINAL"
    enableChat(false);
    currentVotingStats = playerVotesAfter
    getPlayerVotes("FINAL");
  }

  // At 13/15 of the way through (20 seconds if time is 5 mins), enable chat (disables pre-round voting)
  else if (timeLeft === secondsInRound * 14 / 15) {
    phase = "CHAT"
    enableChat(true);
  }
  tick();
}

// Voting Behavior:
// Upvote w/ no previous vote: upvote comment, inc score by 1.
// Upvote w/ previous upvote: un-upvote comment, dec score by 1.
// Upvote w/ previous downvote: un-downvote comment AND upvote comment. Effectively inc score by 2.
// ... same true for downvotes.
function tryCommentVote(msg) {
  let chatMessage = messages[msg.msgNumber];
  console.log(chatMessage);
  let id = msg.id
  let changed = false

  if(msg.vote === "up") {
    if(!chatMessage.upVotes.includes(id)) {
        chatMessage.upVotes.push(id)
        let idx = chatMessage.downVotes.indexOf(id)
        if(idx > -1) {
          chatMessage.downVotes.splice(idx, 1)
        }
    }
    else {
      let idx = chatMessage.upVotes.indexOf(id)
      if(idx > -1) {
        chatMessage.upVotes.splice(idx, 1)
      }
    }
    changed = true
  }

  else if(msg.vote === "down") {
    if(!chatMessage.downVotes.includes(id)) {
      chatMessage.downVotes.push(id)
      let idx = chatMessage.upVotes.indexOf(id)
      if(idx > -1) {
        chatMessage.upVotes.splice(idx, 1)
      }
    }
    else {
      let idx = chatMessage.downVotes.indexOf(id)
      if(idx > -1) {
        chatMessage.downVotes.splice(idx, 1)
      }
    }
    changed = true
  }

    // Update score
    messages[msg.msgNumber].score = chatMessage.upVotes.length - chatMessage.downVotes.length
    // Return bool indicating if any vote changed
    return changed
}

function getPlayerVotes(type) {
  console.log("Asking for client votes!")
  sendToClients({
    event: "GET_VOTES",
    type: type
  })
}

function sendStart() {
  sendToClients({
    event: "START"
  })
}

function enableChat(bool) {
  sendToClients({
    event: "SHOW_CHAT",
    bool: bool
  })
}

function sendToClients(msg) {
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(msg));
    }
  })
}

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}

// listen for requests :)
const listener = app.listen(port, () => {
  console.log("Your app is listening on port " + listener.address().port);
});



app.post("/login", bodyParser.json(), async function (
  request,
  response
) {
  console.log(
    "Login attempted with: " + request.body.username + " " + request.body.password
  );
  var username = request.body.username;
  var password = request.body.password;

  const mongodb = require("mongodb");
  const MongoClient = mongodb.MongoClient;
  //const uri = `mongodb+srv://admin:${process.env.DBPASSWORD}@cluster0.vilmh.mongodb.net/<dbname>?retryWrites=true&w=majority`;
  // TODO take the PASSWORD OUT OF THIS URL !!!WARNING!!! AAAAAAHHHH
  const uri = `mongodb+srv://finalProjectUser:Sh2rczjqOQxDlgLc@cluster0.vilmh.mongodb.net/finalproject?retryWrites=true&w=majority`;
  const client = new MongoClient(
    uri,
    { useNewUrlParser: true },
    { useUnifiedTopology: true }
  );
  await client.connect();
  var collection = await client.db("finalproject").collection("users");
  var results = await collection
    .find({ username: username, password: password })
    .toArray();
  var presentAccountID = null;

  if (results.length > 0) {
    console.log("User aleady has account with ID", results[0]._id.toString());
    //console.log(results[0])
    //console.log(results[0]);
    presentAccountID = results[0]._id.toString();
    //return true;
  } else {
    var newUser = {
      username: username,
      password: password
    };
    var newAccount = await collection.insertOne(newUser);

    presentAccountID = newAccount.insertedId.toString();
    console.log(
      "New Account Created for ",
      username,
      password,
      "and ID: ",
      presentAccountID
    );
  }
  console.log("The account used for logging in is", presentAccountID);
  request.session.accountSession = presentAccountID;
  request.session.auth = true;
  request.session.username = username;
  //response.redirect("/mylists.html");
  response.redirect = "/views/index.html";
  //response.sendFile(__dirname + "/views/index.html");
  response.body = response.json(true);

  client.close();
});

app.get("/logout", async function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

app.get("/getUser", async function (req, res) {
  var user = { username: req.session.username, id: req.session.accountSession }
  res.body = res.json(user);
});

app.get("/getTimeBreakDown", async function (req, res){
  var preRoundVotingTime = secondsInRound * 14/15;
  var postRoundVotingTime = secondsInRound / 15;
  var chattingTime = preRoundVotingTime - postRoundVotingTime;
  preRoundVotingTime = (secondsInRound - preRoundVotingTime)
  var returnObject = {timeString : "Preround voting time = " + preRoundVotingTime + " seconds, Chat time = " + chattingTime + " seconds, Postround voting time = " + postRoundVotingTime + " seconds"}
  res.body = res.json(returnObject);
});

async function getTopic(category) {
  //0 for sports
  //1 for memes
  //2 for politics
  //3 for misc


  const mongodb = require("mongodb");
  const MongoClient = mongodb.MongoClient;
  //const uri = `mongodb+srv://admin:${process.env.DBPASSWORD}@cluster0.vilmh.mongodb.net/<dbname>?retryWrites=true&w=majority`;
  // TODO take the PASSWORD OUT OF THIS URL !!!WARNING!!! AAAAAAHHHH
  const uri = `mongodb+srv://finalProjectUser:Sh2rczjqOQxDlgLc@cluster0.vilmh.mongodb.net/finalproject?retryWrites=true&w=majority`;
  const client = new MongoClient(
    uri,
    { useNewUrlParser: true },
    { useUnifiedTopology: true }
  );
  await client.connect();
  var collection = await client.db("finalproject").collection("topics");
  var results;
  console.log("Category is ", category)
  switch (category) {
    case 0:
      var catString = "food"
      console.log("Getting topic from",catString)
      results = await collection
        .find({ topic: catString })
        .toArray();
      break;
    case 1:
      var catString = "memes"
      console.log("Getting topic from",catString)
      results = await collection
        .find({ topic: catString })
        .toArray();
      break;
    case 2:
      var catString = "politics"
      console.log("Getting topic from",catString)
      results = await collection
        .find({ topic: catString })
        .toArray();
      break;
    case 3:
      var catString = "misc"
      console.log("Getting topic from",catString)
      results = await collection
        .find({ topic: catString })
        .toArray();
      break;
      
  }
  var randomTopicIndex = getRandomInt(results.length - 1)
  console.log(results.length)
  console.log(results[randomTopicIndex])
  client.close();
  return results[getRandomInt(results.length)].text;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}