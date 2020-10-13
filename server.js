const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const PORT = process.env.PORT || 3000;

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;

const uri = `mongodb+srv://nchintada:${process.env.DBPASSWORD}@cluster0.impei.mongodb.net/<dbname>?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true });

let collection = null

client.connect(err => {
  collection = client.db("taskDB").collection("tasks");
  console.log("Connected")
  // perform actions on the collection object
  //client.close();
});

app.use(express.static('public'))

app.get("/", (req, res) => {
	//res.send("Hello World");
	//Just for testing purposes, we need to change this later
	res.sendFile(path.join(__dirname + '/public/tasks.html'))
})

app.post("/add", bodyParser.json(), (req, res) => {
	//code for adding a new task
	collection.insertOne(req.body)
  .then(dbresponse => {
    //console.log(dbresponse)
    res.json(dbresponse.ops[0])
  })
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
