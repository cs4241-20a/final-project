// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const WebSocket = require("ws");
const http = require('http');
const bodyparser = require("body-parser");

const hostname = '127.0.0.1';
const port = 3000;

var playerNum = 1;

var player1X = 200;
var player2X = 200;

var ballx = 0;
var bally = 0;

app.use(express.static("public"));
// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
	response.sendFile(__dirname + "/views/login.html");
});

app.get("/index.html", (request, response) => {
	response.sendFile(__dirname + "/views/index.html");
});

//**********************************deciding player socket**********************************
const firstws = new WebSocket.Server({port: 6969});
firstws.on("connection", ws =>{
	console.log("Client is recieving player number");


	let msg1 = {
		PlayerNum: playerNum
	}
	ws.send(JSON.stringify(msg1))
	
	playerNum++;

	
	console.log("playerNum: " + playerNum);



	ws.on("close", ()=>{
		console.log("Client disconnected from first socket");
	})
});



//**********************************game socket**********************************
const wss = new WebSocket.Server({port: 8082});

let players = 0;

wss.on("connection", ws =>{
	
	console.log("Client connected to game server");

	ws.on("message", data=>{
		//console.log(data);
		let obj = JSON.parse(data);
		let x = obj['PlayerX'];
		let currPlayerNum = obj['PlayerNum'];
		let bx = obj['BallX'];
		let by = obj['BallY'];
		//console.log(currPlayerNum);
		
		if(currPlayerNum === 1){
			ballx = bx;
			bally = by;
			player1X = x;
			let msg = {
				ComputerX: player2X,
				BallX: ballx,
				BallY: bally

			}
			ws.send(JSON.stringify(msg));

		} else if(currPlayerNum === 2){
			player2X = x;
			let msg = {
				ComputerX: player1X,
				BallX: ballx,
				BallY: bally
			}
			ws.send(JSON.stringify(msg));
		} 
		

		

		
	});

	ws.on("close", ()=>{
		console.log("client has disconnected");
	})
});


const mongodb = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://dbUser:llsLiz12@cluster0.yeato.mongodb.net/<dbname>?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true });

let collection = null;
client.connect(err => {
	collection = client.db("datatest").collection("scores");
});

// // make all the files in 'public' available
// // https://expressjs.com/en/starter/static-files.html
// app.use(express.static("public"));

// // https://expressjs.com/en/starter/basic-routing.html
// app.get("/", (request, response) => {
// 	response.sendFile(__dirname + "/views/index.html");
// });

// // // send the default array of dreams to the webpage
// // app.get("/dreams", (request, response) => {
// //   // express helps us take JS objects and send them as JSON
// //   response.json(dreams);
// // });

//Add
app.post("/add", bodyparser.json(), function(req, res) {
	var num = parseInt(req.body.score)

	if(req.body.PlayerNum == 1){
		let json = { score:num, username:username1 }
		console.log("Adding: ", json);
		collection.insertOne(json).then(dbresponse => {
			res.json(dbresponse.ops[0]);
		});
	} else {
		let json = { score:num, username:username2 }
		console.log("Adding: ", json);
		collection.insertOne(json).then(dbresponse => {
			res.json(dbresponse.ops[0]);
		});
	}
	
});

//Gets items in list for specific user
app.post("/items", bodyparser.json(), function(req, res){

	if(req.body.PlayerNum == 1){
		console.log("Getting for:", username1)
		var query = {username:username1}
		collection.find(query).sort({'score':-1}).toArray()
		.then(result => res.json(result))
	} else {
		console.log("Getting for:", username2)
		var query = {username:username2}
		collection.find(query).sort({'score':-1}).toArray()
		.then(result => res.json(result))
	}
	
})

//Remove a Score from Server
app.post("/delete", bodyparser.json(), function(req, res) {
	console.log( "Removing: ", req.body )
	collection
	.deleteOne({ _id: mongodb.ObjectID(req.body.id) })
	.then(result => res.json(result));
});


const listener = app.listen(3000, '0.0.0.0', function() {
	console.log('Listening to port:  ' + 3000);
});

var username1 = null
var username2 = null


app.post("/login", bodyparser.json(), function(req, res) {
	console.log( "Logging in:", req.body )

	if(username1 === null){
		username1 = req.body.username
		var query = {username:username1}
		console.log("Finding user:", query)
		collection.find(query).toArray()
		.then(result => res.json(result))
	} else if (username2 === null){
		username2 = req.body.username
		var query = {username:username2}
		console.log("Finding user:", query)
		collection.find(query).toArray()
		.then(result => res.json(result))
	}
	
});
