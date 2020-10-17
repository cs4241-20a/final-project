// server.js
// where your node app starts'

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const fetch = require("node-fetch");
const compression = require("compression");
const cookieSession = require("cookie-session");
const app = express();
const bodyparse = require("body-parser");

// specific to chat server
const ws = require("ws");
const http = require("http");

require("dotenv").config();

// middleware #1 - // make all the files in 'public' available
app.use(express.static("public"));
// middleware #2 - cookie session
app.use(
  cookieSession({
    httpOnly: false,
    keys: ["secret"]
  })
);

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const uri = `mongodb+srv://admin:a3-admin-password@a3-matt-tolbert.gv63o.mongodb.net/final_project?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true });

let collection = null;
client.connect(err => {
  collection = client.db("final_project").collection("database");
});

// user db
const users_uri = `mongodb+srv://admin:a3-admin-password@a3-matt-tolbert.gv63o.mongodb.net/final_project?retryWrites=true&w=majority`;
const users_client = new MongoClient(users_uri, { useNewUrlParser: true });

let users_collection = null;
users_client.connect(err => {
  users_collection = users_client.db("final_project").collection("users");
});

// middleware #3 - verify mongodb connection
app.use((req, res, next) => {
  if (collection !== null) {
    next();
  } else {
    res.status(503).send();
  }
});

// middleware #4 - convert body to json using bodyparser (consolidates parsing of body for add/modify/delete)
app.use(bodyparse.json());

// middleware #5 - use compression
app.use(compression({ filter: shouldCompress }));

function shouldCompress(req, res) {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

/*
Main Routing Handler
*/
app.get("/", (request, response) => {
  // check if user logged in
  if (request.session.userID) {
    //console.log("Authenticated user found")
    response.sendFile(__dirname + "/views/home.html");
  } else {
    //console.log("No authenticated user found")
    response.sendFile(__dirname + "/views/login.html");
  }
});

/*
Menu Button Handlers
*/

app.get("/goToChat", (request, response) => {
  response.redirect("/chat");
});

app.get("/chat", (request, response) => {
  // check if user logged in
  if (request.session.userID) {
    response.sendFile(__dirname + "/views/chat.html");
  } else {
    response.sendFile(__dirname + "/views/login.html");
  }
});

app.get("/goToUsers", (request, response) => {
  response.redirect("/users");
});

app.get("/users", (request, response) => {
  // check if user logged in
  if (request.session.userID) {
    response.sendFile(__dirname + "/views/users.html");
  } else {
    response.sendFile(__dirname + "/views/login.html");
  }
});

app.get("/goToAbout", (request, response) => {
  response.redirect("/about");
});

app.get("/about", (request, response) => {
  // check if user logged in
  if (request.session.userID) {
    response.sendFile(__dirname + "/views/about.html");
  } else {
    response.sendFile(__dirname + "/views/aboutOpen.html");
  }
});

app.get("/goHome", (request, response) => {
  response.redirect("/");
});

/*
Handle OAuth with GitHub - Tutorial from Kevin Simper @
https://www.kevinsimper.dk/posts/how-to-make-authentication-with-github-apps-for-side-projects
*/
const clientID = "fefd7ab3c9ce0018180d";
const clientSecret = "dd1fff679466ddc8176faa7536be6bf8f84eb78f";

app.get("/login", (req, res) => {
  const path = req.protocol + "://" + req.get("host");
  const url = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${path}/login/github/callback`;
  res.json(url);
});

// get access token from github oauth
async function getAccessToken(code, client_id, client_secret) {
  const request = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id,
      client_secret,
      code
    })
  });
  const text = await request.text();
  const params = new URLSearchParams(text);
  return params.get("access_token");
}

// get users profile from GitHub API
async function fetchGitHubUser(token) {
  const request = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: "token " + token
    }
  });
  return await request.json();
}

app.get("/login/github/callback", async (req, res) => {
  const code = req.query.code;
  const access_token = await getAccessToken(code, clientID, clientSecret);
  const user = await fetchGitHubUser(access_token);
  if (user) {
    console.log("user logged in as " + user.id);
    req.session.userID = user.id;
    req.session.username = user.login;

    // see if user already exists
    var userFound = false;
    users_collection
      .find({})
      .toArray()
      .then(result => {
        result.forEach(element => {
          if (element.userID === user.id) {
            userFound = true;
          }
        });
        if (!userFound) {
          console.log("user not in system, adding them to db");
          // add user to db list of users
          const contents = {
            userID: user.id,
            username: user.login
          };
          users_collection.insertOne(contents);
        } else {
          console.log("User is in system, not adding them again...");
        }
      });
    res.redirect("/");
  } else {
    // reload the page
    console.log("Could not login user");
    res.redirect("/login.html");
  }
});

// logout user
app.get("/logout", (req, res) => {
  if (req.session) req.session = null;
  res.redirect("/");
});

/*
Data Management endpoints
*/

//TODO get users other than requesting users
app.get("/getUsers", (req, res) => {
  users_collection
    .find({})
    .toArray()
    .then(result => {
      // only return other users
      result = result.filter(function(value, index, arr) {
        return value.userID != req.session.userID;
      });
      res.json(result);
    });
});

app.post("/otherData", (req, res) => {
  var userData = [];
  collection
    .find({ userID: req.body.requestID })
    .toArray()
    .then(result => res.json(result));
});

app.get("/data", (req, res) => {
  var userData = [];
  collection
    .find({ userID: req.session.userID })
    .toArray()
    .then(result => res.json(result));
});

app.post("/add", (req, res) => {
  // pull contents from req and insert to DB
  const contents = {
    userID: req.session.userID,
    date: req.body.date,
    musclegroup: req.body.musclegroup,
    exercise: req.body.exercise,
    repcount: req.body.repcount,
    weight: req.body.weight
  };
  console.log(contents);
  collection.insertOne(contents).then(result => {
    // return entry from DB so that client can keep track of _id
    res.json(result.ops[0]);
  });
});

app.post("/delete", (req, res) => {
  collection
    .deleteOne({ _id: mongodb.ObjectID(req.body._id) })
    .then(result => res.json(result));
});

app.post("/update", (req, res) => {
  const json = {
    userID: req.session.userID,
    date: req.body.date,
    musclegroup: req.body.musclegroup,
    exercise: req.body.exercise,
    repcount: req.body.repcount,
    weight: req.body.weight
  };
  collection
    .updateOne({ _id: mongodb.ObjectID(req.body._id) }, { $set: json })
    .then(result => res.json(result));
});

// ------------------- Chat server ------------
const server = http.createServer(app);

const socketServer = new ws.Server({ server });

const clients = [];

let count = 0;
socketServer.on("connection", client => {
  // when the server receives a message from this client...
  client.on("message", msg => {
    console.log(msg);
    // send msg to every client EXCEPT
    // the one who originally sent it. in this demo this is
    // used to send p2p offer/answer signals between clients
    if (msg.includes("commence connection")) {
    }
    clients.forEach(c => {
      if (c !== client) c.send(msg);
    });
  });

  // add client to client list
  clients.push(client);

  client.send(
    JSON.stringify({
      address: "connect",
      // we only initiate p2p if this is the second client connected
      initiator: ++count % 2 === 0
    })
  );
});
// --------------------------------------------

// listen for requests :)
const listener = server.listen(3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
