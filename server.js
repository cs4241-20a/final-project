// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
app.use(express.static("public"));

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const uri = `mongodb+srv://lpadir:${process.env.DBPASSWORD}@cluster0.caywp.mongodb.net/datatest?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true });

let collection = null;
client.connect(err => {
  collection = client.db("finalproject").collection("users");
});


// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/userinfo.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

app.post("/add", bodyparser.json(), function(req, res) {
  console.log("body:", req.body);
  collection.insertOne(req.body).then(dbresponse => {
    res.json(dbresponse.ops[0]);
  });
});


app.post("/enter", bodyparser.json(), function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
  
});

app.post("/home", function(req, res) {
  res.sendFile(__dirname + "/views/userinfo.html");
});

