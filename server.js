const express = require("express");
const app = express();
const ws = require("ws");
const http = require("http");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
var MongoClient = require("mongodb").MongoClient;
const { auth } = require("express-openid-connect");
const { requiresAuth } = require("express-openid-connect");
const unirest = require("unirest");

//chat code

app.use(express.static("public"));

const server = http.createServer(app);

const socketServer = new ws.Server({ server });

const clients = [];

socketServer.on("connection", client => {
  // when the server receives a message from this client...
  client.on("message", msg => {
    // send msg to every client EXCEPT
    // the one who originally sent it
    clients.forEach(c => {
      if (c !== client)
        //comment out because you want the client who sent the message to also print-- add logic to server and client
        c.send(msg);
    });
  });

  // add clien to client list
  clients.push(client);
});

server.listen(3000);

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: "a long, randomly-generated string stored in env",
  baseURL: "https://final-project-007.glitch.me",
  clientID: "Ifo12kP3EdoQNqapXQ1MIjGzvr5m6i52",
  issuerBaseURL: "https://dev-38c6opea.us.auth0.com"
};

app.use(express.static("public"));
app.use(express.static("views"));
app.use(express.json());
app.use(auth(config));

const uri = `mongodb+srv://admin:${process.env.PASSWORD}@cluster007.luauw.mongodb.net/<dbname>?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let groupcollection = null;
client.connect(err => {
  groupcollection = client.db("grocery-application").collection("groups");
  console.log("connected!");
});

app.get("/state", (req, res) => {
  res.send(
    req.oidc.isAuthenticated()
      ? { state: "Logged in" }
      : { state: "Logged Out" }
  );
});

//makes user info available for everyone
app.use(function(req, res, next) {
  res.locals.user = req.oidc.user;
  next();
});

// route to get all docs
app.get("/showData", requiresAuth(), (req, res) => {
  if (groupcollection !== null) {
    // get array and pass to res.json
    groupcollection
      .find({})
      .toArray()
      .then(result => res.json(result));
  }
});

//login
app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

//accessing grocery page
app.get("/grocery", requiresAuth(), (req, res) => {
  res.redirect("https://final-project-007.glitch.me/grocery.html");
});

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// add a task
app.post("/addGroup", bodyParser.json(), function(request, response) {

  // return a promise, it will sh ow the data with the unique id
  groupcollection.insertOne(request.body).then(dbresponse => {
    let newGroup = dbresponse.ops[0];
    response.json(newGroup);
  });
});

app.post("/delete", bodyParser.json(), function(req, res) {
  console.log(req);
  groupcollection
    .updateOne(
      { _id: mongodb.ObjectID(req.body.id) },
      {
        $set: {
          cartList: req.body.cartList,
          fridgeList: req.body.fridgeList,
          pantryList: req.body.pantryList
        }
      }
    )
    .then(result => {
      res.json(result);
    });
});

app.post("/updateQuantity", bodyParser.json(), function(req, res) {
  console.log(req);
  groupcollection
    .updateOne(
      { _id: mongodb.ObjectID(req.body.id) },
      {
        $set: {
          cartList: req.body.cartList,
          fridgeList: req.body.fridgeList,
          pantryList: req.body.pantryList
        }
      }
    )
    .then(result => {
      res.json(result);
    });
});

app.post("/updateArrays", bodyParser.json(), function(req, res) {
  console.log(req);
  groupcollection
    .updateOne(
      { _id: mongodb.ObjectID(req.body.id) },
      {
        $set: {
          cartList: req.body.cartList,
          fridgeList: req.body.fridgeList,
          pantryList: req.body.pantryList
        }
      }
    )
    .then(result => {
      res.json(result);
    });
});

app.post("/modifyCart", bodyParser.json(), function(req, res) {
  groupcollection
    .updateOne(
      { _id: mongodb.ObjectID(req.body.id) },
      { $set: { cartList: req.body.cartList } }
    )
    .then(result => {
      res.json(result);
    });
});

app.post("/findgroup", bodyParser.json(), function(req, res) {
  console.log(req.body.groupname);
  groupcollection
    .find({ groupname: req.body.groupname })
    .toArray()
    .then(dbresponse => {
      res.json(dbresponse[0]);
    });
});

app.get("/test", function(req, res) {
  console.log("this is the test server");

  unirest
    .get("https://api.spoonacular.com/recipes/findByIngredients")
    .header("X-Mashape-Key", "41104a1193cc43db936641520f872598")
    .header("Accept", "application/json")
    .end(function(result) {
      res.end(result);
    });
  //databaseFill(recipeObject, ingredientArr);
});
//api.searchRecipesByIngredients(username, hash, includeIngredients,callback);
