const express = require("express");
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config({path: './config.env'});
const connectDb = require("./config/db");
const morgan = require("morgan");
const mongodb = require('mongodb');
const ObjectID = require('mongodb').ObjectID;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieSession = require('cookie-session');
const app = express();
const Ably = require("ably");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const cookieParser = require("cookie-parser"); // parse cookie header
const mongoose = require("mongoose");
const {ensureAuth, ensureGuest} = require("./middleware/auth");


// morgan logging
app.use(morgan("dev"));

app.use(express.static("public"));
app.use(bodyParser.json());

app.use(cookieSession({
    name: "session",
    keys: ["thisappisawesome"],
    maxAge: 24 * 60 * 60 * 100
}));

// parse cookies
app.use(cookieParser());

// Sessions
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongooseConnection: mongoose.connection})
    })
)


//////////////////////// MONGO STUFF ////////////////////////
const client = new mongodb.MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let collection = null;

client.connect()
    .then(() => {
        return client.db('final-project').collection('users');
    })
    .then(__collection => {
        collection = __collection;

        return collection.find({}).toArray();
    })
    .then(console.log("MongoDB Connected Successfully!"));


//////////////////////// PASSPORT JS STUFF ////////////////////////
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(
    function (userName, passWord, done) {
        collection.find({
            username: userName,
        }).toArray()
            .then(function (result) {
                // successful login
                if (result.length >= 1) {
                    console.log("Successful Login!")
                    console.log(result);

                    // verify password
                    if (result[0].password === passWord) {
                        return done(null, userName, {
                            message: "Login Successful!"
                        });
                    } else {
                        return done(null, null, {
                            message: "Incorrect username / password"
                        });
                    }
                } else {
                    // create new user
                    collection.insertOne({username: userName, password: passWord})
                        .then(() => {
                            return done(null, userName);
                        });
                }
            });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

//////////////////////// GAME VARS ////////////////////////

const CANVAS_HEIGHT = 750;
const CANVAS_WIDTH = 1400;
const PLAYER_VERTICAL_INCREMENT = 20;
const PLAYER_VERTICAL_MOVEMENT_UPDATE_INTERVAL = 1000;
const PLAYER_SCORE_INCREMENT = 5;
const P2_WORLD_TIME_STEP = 1 / 16;
const MIN_PLAYERS_TO_START_GAME = 2;
const GAME_TICKER_MS = 100;

let peopleAccessingTheWebsite = 0;
let players = {};
let coins = {};
let walls = [] // 2d array of the whole board (walls)
let playerChannels = {};
let gameOn = false;
let alivePlayers = 0;
let totalPlayers = 0;
let gameRoom;
let gameTickerOn = false;
let world;

let avatarColors = ["green", "cyan", "yellow"];
let avatarTypes = ["A", "B", "C"];


// setup ably
const realtime = new Ably.Realtime({
    key: process.env.ABLY_API_KEY,
    echoMessages: false,
});


///////////////////// GAME LOGIC ////////////////////////
function subscribeToPlayerInput(channelInstance, playerId) {
    channelInstance.subscribe("pos", (msg) => {
        console.log(msg);

        if (msg.data.keyPressed == "left") {

        } else if (msg.data.keyPressed == "right") {

        }
    });
}

function moveEveryPlayer() {
    // change every players position in the players direction

    // check if the move is legal


    // check if player picked a coin


    // check if players die
}

const startGameDataTicker = function () {
    let tickInterval = setInterval(() => {
        if (!gameTickerOn) {
            clearInterval(tickInterval);
        } else {
            // move every player
            moveEveryPlayer();

            gameRoom.publish("game-state", {
                players: players,
                playerCount: totalPlayers,
                gameOn: gameOn,
                deadPlayers: {},
                coins: coins,
            });
        }
    }, GAME_TICKER_MS);
}


const handlePlayerEntered = function (player) {
    let newPlayerId;
    alivePlayers++;
    totalPlayers++;

    if (totalPlayers === 1) {
        gameTickerOn = true;
        startGameDataTicker();
    }

    newPlayerId = player.clientId;
    playerChannels[newPlayerId] = realtime.channels.get(
        "clientChannel-" + player.clientId
    );

    //TODO figure out how to spawn them in a smarter way

    let newPlayerObject = {
        id: newPlayerId,
        x: Math.floor((Math.random() * 1370 + 30) * 1000) / 1000,
        y: 20,
        invaderAvatarType: avatarTypes[randomAvatarSelector()], // get from db
        invaderAvatarColor: avatarColors[randomAvatarSelector()],
        score: 0,
        nickname: player.data,
        isAlive: true,
        direction: [1, 0],
    };

    players[newPlayerId] = newPlayerObject;
    subscribeToPlayerInput(playerChannels[newPlayerId], newPlayerId);
}

const handlePlayerLeft = function (player) {
    let leavingPlayer = player.clientId;
    alivePlayers--;
    totalPlayers--;
    delete players[leavingPlayer];
    if (totalPlayers <= 0) {
        resetServerState();
    }
}

function resetServerState() {
    peopleAccessingTheWebsite = 0;
    gameOn = false;
    gameTickerOn = false;
    totalPlayers = 0;
    alivePlayers = 0;
    for (let item in playerChannels) {
        playerChannels[item].unsubscribe();
    }
}

function randomAvatarSelector() {
    return Math.floor(Math.random() * 3);
}

///////////////////// END GAME LOGIC ////////////////////////

// initialize channels and channel-listeners
realtime.connection.once("connected", () => {
    gameRoom = realtime.channels.get("game-room");
    gameRoom.presence.subscribe("enter", (player) => handlePlayerEntered(player));
    gameRoom.presence.subscribe("leave", (player) => handlePlayerLeft(player));
});


// routes
app.get("/auth/game", (request, response) => {
    const tokenParams = {clientId: request.user};
    realtime.auth.createTokenRequest(tokenParams, function (err, tokenRequest) {
        if (err) {
            response
                .status(500)
                .send("Error requesting token: " + JSON.stringify(err));
        } else {
            response.setHeader("Content-Type", "application/json");
            response.send(JSON.stringify(tokenRequest));
        }
    });
});

// routes
app.get('/', ensureAuth, (req, res) => {
    console.log(req.user);
    res.sendFile(__dirname + "/views/home.html");
});

app.get('/login', ensureGuest, (req, res) => {
    res.sendFile(__dirname + "/views/login.html");
});

app.get('/game', ensureAuth, (req, res) => {
    res.sendFile(__dirname + "/views/game.html");
});

app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/login')
});

app.post("/auth/signin", passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
    res.redirect('/');
});

app.listen(process.env.PORT, () => {
    console.log("Server is listening on port: ", process.env.PORT);
});
