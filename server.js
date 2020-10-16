const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 3000;

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;

//console.log(process.env.DBPASSWORD)
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

app.post('/edit', bodyParser.json(), (request, response) => {
	console.log(request.body)
	collection
    .updateOne({ _id:mongodb.ObjectID( request.body._id ) },
      { $set:{ task:request.body.task,
              duedate:request.body.duedate,
              assignee:request.body.assignee,
						 	tags:request.body.tags,
							description:request.body.description}
      }
    )
    .then( result => {
      //console.log(result)
      response.json( result )
  })
})

app.post('/delete', bodyParser.json(), (request, response) => {
  console.log("Delete: ", request.body)
  collection
    .deleteOne({ _id:mongodb.ObjectID( request.body.id ) })
    .then( result => {
      response.json( result )
  })
})

app.get('/tasks', bodyParser.json(), (request, response) => {
	//console.log("Here's our group: " + request.group)
	//Leaving out accessing a specific group for right now
  collection.find().toArray()
    .then(docs => {
    response.json(docs)
  })
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
