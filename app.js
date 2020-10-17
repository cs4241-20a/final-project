const express = require('express');
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const passport = require("passport");
const favicon = require('serve-favicon');
const dotenve = require('dotenv').config();
const compression = require("compression");
const session = require("express-session");
const {MongoClient, ObjectId} = require("mongodb");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require('body-parser')

const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

const port = 5000;
const uri = process.env.FP_URI;
const mongoSetup = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
};

app.use(express.static("public"));

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.set("trust proxy", 1); // trust first proxy
app.use(morgan("combined"));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => next());
app.use(favicon(__dirname + '/public/assets/favicon.ico'))
app.use(
  session({
    secret: process.env.FP_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

let players = {};
let inGame = {};
let gameTimeout;


const gameLogic = () => {
	if(Math.random() >= .5){
		io.emit('comet', 
			{x: Math.floor(Math.random() * 750) + 50, 
			 velocityY: Math.floor(Math.random() * 100) + 50,
			 velocityX: Math.floor(Math.random() * 50) - 25});
	} else {
		io.emit('star', 
			{x: Math.floor(Math.random() * 750) + 50});
	}
	gameTimeout = setTimeout(gameLogic, Math.floor(Math.random() * 1000) + 200);
};

const addNewPlayer = (id) => {
	players[id] = {
		playerId: id,
		x: Math.floor(Math.random() * 150 + 50),
		y: 450,
		team: [0x454545, 0x8E5DFB, 0xFFFFFF][Math.floor(Math.random() * 3)],
		ready: false
	}
}

io.on('connection', (socket) =>  {
	socket.on('start', () => {
		console.log('creating');
		addNewPlayer(socket.id);
		socket.emit('currentPlayers', players);
		socket.broadcast.emit('newPlayer', players[socket.id]);
	});

	socket.on('ready', () => {
		if (players[socket.id] === undefined)
			addNewPlayer(socket.id)
		players[socket.id].ready = true;

		Object.values(players).some((player) => {
			if (!player.ready){
				return true;
			}

			io.emit('startGame');
			gameTimeout = setTimeout(gameLogic, 2000);
		});
	});


	socket.on('inGame', () => {
		inGame[socket.id] = true;
		socket.emit('gamePlayers', players);
	});

	socket.on('gameOver', () => {
		inGame[socket.id] = false;
		Object.values(inGame).some((player) => {
			if (player){
				return true;
			}
			clearTimeout(gameTimeout);
			io.emit('endGame');
			inGame = {};
		});
	});

	socket.on('playerMovement', (movementData) => {
		try {
			players[socket.id].x = movementData.x;
			players[socket.id].y = movementData.y;

			socket.broadcast.emit('playerMoved', players[socket.id]);
		} catch (e) {
			addNewPlayer(socket.id);
		}
	})

	socket.on('disconnectLobby', () => {
		setTimeout(() => delete players[socket.id], 200);
		io.emit('disconnect', socket.id);
	})


	socket.on('disconnectGame', () => {
		setTimeout(() => delete players[socket.id], 200);
  
		io.emit('disconnect', socket.id);
	});
  
	socket.on('send-chat-message', message => {
		socket.broadcast.emit('chat-message', message)
	});
});

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});

passport.use(
	new LocalStrategy(async (username, password, done) => { //highScore,
		const client = new MongoClient(uri, mongoSetup);

		await client.connect();
		const collection = client.db("fp-database").collection("users");

		const docs = await collection.find({ username, github: false }).toArray();

		if (docs.length == 0) {
			bcrypt.genSalt(10, async (err, salt) => {
				bcrypt.hash(password, salt, async (err, hash) => {
					const user = {
						username,
						password: hash,
						highScore: 0,
						github: false,
					};
					await collection.insertMany([user]);
					await client.close();
					done(null, user);
				});
			});
		} else {
			await client.close();
			bcrypt.compare(password, docs[0].password, function (err, result) {
				if (result) {
					done(null, docs[0]);
				} else {
					done(null, false);
				}
			});
		}
	})
);

app.post("/login", passport.authenticate("local"), function (req, res) {
	req.login(req.user, () => {
		delete req.user.password;
		return res.json(req.user);
	});
});

app.get("/logout", function (req, res) {
	req.logout();
	return res.send();
});

app.post("/setHighScore", async (req, res) => {

	const object = req.body.user;

	const client = new MongoClient(uri, mongoSetup);
	await client.connect();
	const collection = client.db("fp-database").collection("users");


	await collection.updateOne(
		{ username: object.username },
		{ $set: { highScore: object.highScore } }
	);

	const docs = await collection.find({ user: req._id }).toArray();
	await client.close();
	return res.json(docs);
});

app.get("/api/getAllUsers", async (req, res) => {

	const client = new MongoClient(uri, mongoSetup);

	//alter collection objects
	await client.connect();
	const collection = client.db("fp-database").collection("users");

	const docs = await collection.find({ user: req.sessionId }).toArray();

	//alter collection objects
	await client.close();
	res.send(JSON.stringify(docs));
});

app.get("/api/getUser", async (req, res) => {
	if (req.user) delete req.user.password;
	return res.json(req.user || {});
});

app.get("/", (_, response) => {
	response.sendFile(__dirname + "/public/index.html");
});

const listener = server.listen(process.env.PORT || port, () => {
	console.log("Your app is listening on port " + listener.address().port);
});


