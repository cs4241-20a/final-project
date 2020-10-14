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
                    collection.insertOne({username: userName, password: passWord, score: 0})
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

const PLAYER_MOVEMENT_INCREMENT = 25;
const CANVAS_HEIGHT = 750;
const CANVAS_WIDTH = 1400;
const CANVAS_TO_ARRAY_HEIGHT_MODIFIER = (CANVAS_HEIGHT / PLAYER_MOVEMENT_INCREMENT) / CANVAS_HEIGHT
const CANVAS_TO_ARRAY_WIDTH_MODIFIER = (CANVAS_WIDTH / PLAYER_MOVEMENT_INCREMENT) / CANVAS_WIDTH
const PLAYER_VERTICAL_MOVEMENT_UPDATE_INTERVAL = 1000;
const PLAYER_SCORE_INCREMENT = 5;
const P2_WORLD_TIME_STEP = 1 / 16;
const OTHER_AXIS_RANGE = 20;
const SAME_AXIS_RANGE = 12;
const MIN_PLAYERS_TO_START_GAME = 4;
const PLAYER_MOVEMENT_OFFSET = PLAYER_MOVEMENT_INCREMENT / 2;

const GAME_TICKER_MS = 500;

let peopleAccessingTheWebsite = 0;
let players = {};
let monsters = {
    "Ada": {x: 687.5, y: 362.5, direction: 1},
    "Johny": {x: 687.5, y: 362.5, direction: 1},
    "Clay": {x: 687.5, y: 362.5, direction: 1},
    "Ivan": {x: 687.5, y: 362.5, direction: 1},
    "Bob": {x: 687.5, y: 362.5, direction: 1}
};
let deadPlayersLeft = [];
let deadPlayers = new Array();
let rankings = new Array();
let coins = {}; // idea was to store this as an object so we can check if the size of the coins is 0 - at that point, the game is over
let walls = [ // 2d array of the whole board (walls) ( 1 is a wall, 0 is empty space that a player can occupy ) this will be 56x30  (each position is 25px).
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
let playerChannels = {};
let gameOn = false;
let alivePlayers = 0;
let totalPlayers = 0;
let gameRoom;
let gameTickerOn = false;

// spawn locations - these are currently hardcoded for a 1400x750px board
let spawnLocations = [{x: 1362.5, y: 712.5, occupied: false}, {x: 37.5, y: 712.5, occupied: false}, {
    x: 1362.5,
    y: 37.5,
    occupied: false
}, {x: 37.5, y: 37.5, occupied: false}]
let boss = {x: 687.5, y: 362.5}

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
        if (msg.data.keyPressed === "left") { // direction is West
            players[playerId].direction = 4;
        } else if (msg.data.keyPressed === "right") { // direction is East
            players[playerId].direction = 2;
        } else if (msg.data.keyPressed === "up") { // direction is North
            players[playerId].direction = 1;
        } else if (msg.data.keyPressed === "down") { // direction is South
            players[playerId].direction = 3;
        }
        // console.log( "Canvas W: " + CANVAS_WIDTH
        //  + ", Canvas H: "+ CANVAS_HEIGHT
        //  + ", Player X: " + players[playerId].x
        //  + ", Player Y: " + players[playerId].y )
    });

}

// move all present players based on their keyboard input
function moveEveryPlayer() {

    Object.values(players).forEach(function (player) {

        if (player !== null) {

            let tryDirection = player.direction;
            let previousX = player.x;
            let previousY = player.y;

            let movementDirection = (tryDirection === 1 || tryDirection === 3) ? 0 : 1;

            if (player.isAlive === false) {
                //console.log("FOUND DEAD PLAYER: " + player.id);
            }

            // can move in the current direction
            if (player.isAlive !== false && canMove(tryDirection, player)) {
                // console.log( "We can move in this direction: " + tryDirection )
                if (tryDirection === 1) { // direction is North
                    player.y -= PLAYER_MOVEMENT_INCREMENT
                    checkIfDead(player.id, player.y, previousY, previousX, movementDirection)

                } else if (tryDirection === 2) { // direction is West
                    player.x += PLAYER_MOVEMENT_INCREMENT
                    checkIfDead(player.id, previousX, player.x, previousY, movementDirection)

                } else if (tryDirection === 3) { // direction is South
                    player.y += PLAYER_MOVEMENT_INCREMENT
                    checkIfDead(player.id, previousY, player.y, previousX, movementDirection)

                } else if (tryDirection === 4) { // direction is East
                    player.x -= PLAYER_MOVEMENT_INCREMENT
                    checkIfDead(player.id, player.x, previousX, previousY, movementDirection)
                }
            }

            //console.log( "My player " + player.id + " updated position: x = " + player.x + ", y = " + player.y )
        }
        //console.log("My player's updated position: x = " + player.x + ", y = " + player.y)

        player.score += collectCoin(Math.floor(player.x / 25), (Math.floor(player.y / 25)))
    })
}

function getCoinId(x, y) {
    if (x < 10) {
        x = `0${x}`
    }

    if (y < 10) {
        y = `0${y}`
    }

    return `${x}|${y}`;
}

function collectCoin(x, y) {
    let coordinates = getCoinId(x, y)
    if (coordinates in coins) {
        let score = coins[coordinates]
        delete coins[coordinates]
        return score
    }
    return 0
}


function checkRange(positionVal, minimalRange, maxRange, constant) {
    if ((positionVal >= (minimalRange - constant)) &&
        (positionVal <= (maxRange + constant))) {
        return true;

    }

    return false;
}


function checkIfDead(id, minRange, maxRange, otherAxisVal, direction) {
    let inRange = false;
    let currentPlayerDead = false;

    Object.values(players).forEach(function (player) {
        if (player.id !== id && player.isAlive) {
            // direction was vertical (SAME AXIS WOULD BE Y-AXIS)
            if (direction === 0) {

                if (checkRange(player.y, minRange, maxRange, SAME_AXIS_RANGE) &&
                    checkRange(player.x, otherAxisVal, otherAxisVal, OTHER_AXIS_RANGE)) {
                    inRange = true;
                }

            } else { // direction was horizontal (SAME AXIS WOULD BE X-AXIS)

                if (checkRange(player.x, minRange, maxRange, SAME_AXIS_RANGE) &&
                    checkRange(player.y, otherAxisVal, otherAxisVal, OTHER_AXIS_RANGE)) {
                    inRange = true;
                }
            }

            if (inRange) {
                currentPlayerDead = true;
                player.isAlive = false;
                deadPlayers.push(player);
                deadPlayers.push(players[id]);
            }
        }

        inRange = false
    })

    Object.values(monsters).forEach(function (monster) {
        if (direction === 0) {

            if (checkRange(monster.y, minRange, maxRange, SAME_AXIS_RANGE) &&
                checkRange(monster.x, otherAxisVal, otherAxisVal, OTHER_AXIS_RANGE)) {
                inRange = true;
            }

        } else { // direction was horizontal (SAME AXIS WOULD BE X-AXIS)

            if (checkRange(monster.x, minRange, maxRange, SAME_AXIS_RANGE) &&
                checkRange(monster.y, otherAxisVal, otherAxisVal, OTHER_AXIS_RANGE)) {
                inRange = true;
            }
        }

        if (inRange) {
            currentPlayerDead = true;
        }

        inRange = false
    })

    if (currentPlayerDead) {
        if (players[id].isAlive) {
            console.log("Killing Current")
            console.log(id)
            deadPlayers.push(players[id])
            players[id].isAlive = false;
        }

        savePlayerScore(id)
        //players[id].score =100; for testing purposes
        //console.log("Deleted " + players[id].id);
        //delete players[id];
    }
}

function savePlayerScore(id) {
    collection
        .updateOne(
            {username: players[id].id},
            {
                $set: {"score": players[id].score}
            }
        )
}


function withinBoundary(x, y) {
    if (x >= 0 && x <= CANVAS_WIDTH) {
        if (y >= 0 && y <= CANVAS_HEIGHT) {
            return true;
        }
    }

    return false;
}

function gameHasEnded() {
    let numOfDeadPlayers = deadPlayers.length

    let count = Object.keys(coins).length

    // do no know if this works
    if (count === 0) {
        return true;
    }

    //console.log(numOfDeadPlayers)
    //console.log(totalPlayers)

    if (totalPlayers > 1) {
        if (numOfDeadPlayers === totalPlayers || numOfDeadPlayers === (totalPlayers - 1)) {
            return true;
        }

    } else if (totalPlayers === 1) {
        if (numOfDeadPlayers === totalPlayers) {
            return true;
        }
    }


    return false;
}


function finishGame() {

    console.log("Dead Players = " + deadPlayers.length)
    console.log("Alive Players = " + alivePlayers)

    let winnerName = "Nobody";

    Object.values(players).forEach(function (player) {
        rankings.push({
            name: player.id,
            score: player.score,
        });
        collection
            .updateOne(
                {username: player.id},
                {
                    $set: {"score": player.score}
                }
            )
    });

    rankings.sort((a, b) => {
        return b.score - a.score;
    });

    if (totalPlayers === 1) {
        winnerName = rankings[0].name;

    } else if (rankings[0].score !== rankings[1].score) {
        winnerName = rankings[0].name;
    }


    gameRoom.publish("game-over", {
        winner: winnerName,
        totalPlayers: totalPlayers,
    });

    console.log("GAME OVER");
    resetServerState();
}


// check if a player's move would be valid
// check against game boundaries
// check against wall locations
function canMove(direction, player) {

    if (players[player.id] === null) {
        return false;
    }

    let positionX = player.x;
    let positionY = player.y;

    // console.log( "My current location: Pixels - " + positionX + ", " + positionY ". Array - " )

    var positionXArray = 1
    var positionYArray = 1
    //console.log("My direction: " + direction)
    if (direction === 1) { // direction is North
        positionY -= PLAYER_MOVEMENT_INCREMENT;
        positionXArray = (positionX - PLAYER_MOVEMENT_OFFSET) * CANVAS_TO_ARRAY_WIDTH_MODIFIER
        positionYArray = (positionY - PLAYER_MOVEMENT_OFFSET) * CANVAS_TO_ARRAY_HEIGHT_MODIFIER


    } else if (direction === 2) { // direction is East
        positionX += PLAYER_MOVEMENT_INCREMENT;
        positionXArray = (positionX - PLAYER_MOVEMENT_OFFSET) * CANVAS_TO_ARRAY_WIDTH_MODIFIER
        positionYArray = (positionY - PLAYER_MOVEMENT_OFFSET) * CANVAS_TO_ARRAY_HEIGHT_MODIFIER

    } else if (direction === 3) { // direction is South
        positionY += PLAYER_MOVEMENT_INCREMENT;
        positionXArray = (positionX - PLAYER_MOVEMENT_OFFSET) * CANVAS_TO_ARRAY_WIDTH_MODIFIER
        positionYArray = (positionY + PLAYER_MOVEMENT_OFFSET) * CANVAS_TO_ARRAY_HEIGHT_MODIFIER - 1

    } else if (direction === 4) { // direction is West
        positionX -= PLAYER_MOVEMENT_INCREMENT;
        positionXArray = (positionX + PLAYER_MOVEMENT_OFFSET) * CANVAS_TO_ARRAY_WIDTH_MODIFIER - 1
        positionYArray = (positionY - PLAYER_MOVEMENT_OFFSET) * CANVAS_TO_ARRAY_HEIGHT_MODIFIER
    }

    if (!withinBoundary(positionXArray, positionYArray)) {
        console.log("Error! That would be outside of the boundary. X: " + positionX + ", Y: " + positionY)
        return false;
    }

    //checking if wall is present

    //console.log( "destination coordinates: Pixels - " + positionX + ", " + positionY + ". Array - " + positionYArray + ", " + positionXArray )
    // console.log( "That space contains: " + walls[positionYArray][positionXArray] )
    if (walls[positionYArray][positionXArray] === 1) {
        //console.log("There is a wall here")
        return false;
    } else {
        return true
    }

}

function moveAllMonsters() {
    Object.values(monsters).forEach(function (monster) {
            let backwards = 1
            switch (monster.direction) {
                case 1:
                    backwards = 3
                    break
                case 2:
                    backwards = 4
                    break
                case 3:
                    backwards = 1
                    break
                case 4:
                    backwards = 2
                    break
            }
            let newDirection = getRandomAvailableDir(monster, backwards)
            monster.direction = newDirection

            if (newDirection === 1) { // direction is North
                monster.y -= PLAYER_MOVEMENT_INCREMENT

            } else if (newDirection === 2) { // direction is West
                monster.x += PLAYER_MOVEMENT_INCREMENT

            } else if (newDirection === 3) { // direction is South
                monster.y += PLAYER_MOVEMENT_INCREMENT

            } else if (newDirection === 4) { // direction is East
                monster.x -= PLAYER_MOVEMENT_INCREMENT
            }
            // console.log("Monster's new position: " + monster.x + ", " + monster.y)
        }
    )
}

function moveBoss() {
    // get the closes player target
    let agroRange = 1300; //TODO: maybe change later
    let closestPlayerSoFar = null;
    let closestDistanceSoFar = 1000000;
    for (let playerId in players) {
        if (players[playerId].isAlive) {
            let distance = Math.sqrt(Math.pow(boss.x - players[playerId].x, 2) + Math.pow(boss.y - players[playerId].y, 2));

            if (distance < closestDistanceSoFar && distance <= agroRange) {
                closestPlayerSoFar = players[playerId]
                closestDistanceSoFar = distance
            }
        }
    }

    if (closestPlayerSoFar != null) {
        // we have a target

        let targetGridNode = {x: Math.floor(closestPlayerSoFar.x / 25), y: (Math.floor(closestPlayerSoFar.y / 25))};
        let currentGridNode = {x: Math.floor(boss.x / 25), y: (Math.floor(boss.y / 25))};

        let pathToTheUser = findPathAStar(currentGridNode, targetGridNode);

        if (pathToTheUser.length > 1) {
            boss.x = ((pathToTheUser[1].x + 1) * 25) - Math.floor(25 / 2)
            boss.y = ((pathToTheUser[1].y + 1) * 25) - Math.floor(25 / 2)

            // check if boss kills the player
            if (pathToTheUser[1].x === targetGridNode.x && pathToTheUser[1].y === targetGridNode.y) {
                // death
                players[closestPlayerSoFar.id].isAlive = false;
                deadPlayers.push(closestPlayerSoFar);
                savePlayerScore(closestPlayerSoFar.id);
            }
        }
    }
}

function getRandomAvailableDir(monster, backwards) {
    let available = []
    for (let i = 1; i < 5; i++) {
        if (i !== backwards && canMove(i, monster)) {
            available.push(i)
        }
    }
    //console.log(available, backwards)
    if (available.length === 0) return backwards
    return available[Math.floor(Math.random() * available.length)]
}


const startGameDataTicker = function () {

    for (let i = 0; i < walls[0].length; i++) {
        for (let j = 0; j < walls.length; j++) {
            if (walls[j][i] === 0) {
                let id = getCoinId(i, j)
                let coin = 5
                coins[id] = coin
            }
        }
    }

    let tickInterval = setInterval(() => {
        if (!gameTickerOn) {
            clearInterval(tickInterval);
        } else {
            // move every player
            moveEveryPlayer();
            moveAllMonsters();
            moveBoss();
            gameRoom.publish("game-state", {
                players: players,
                playerCount: totalPlayers,
                gameOn: gameOn,
                monsters: monsters,
                boss: boss,
                coins
            });

            // right here check for end game
            if (gameHasEnded()) {
                finishGame();
            }
        }
    }, GAME_TICKER_MS);
}


const handlePlayerEntered = function (player) {

    let playedBefore = false;

    console.log(player.clientId);

    deadPlayersLeft.forEach((player) => {
        if (player.id === player.clientId)
            playedBefore = true;
    })

    if (!playedBefore) {

        let newPlayerId;
        alivePlayers++;
        totalPlayers++;

        let xPos;
        let yPos;
        if (totalPlayers === 1) {
            gameTickerOn = true;
            startGameDataTicker();
        }

        newPlayerId = player.clientId;
        playerChannels[newPlayerId] = realtime.channels.get(
            "clientChannel-" + player.clientId
        );


        // check through the spawn locations to find a location that has not been used yet


        for (location of spawnLocations) {
            if (location.occupied === false) {
                xPos = location.x
                yPos = location.y
                location.occupied = true
                break;
            }
        }

        //TODO figure out how to spawn them in a smarter way

        let newPlayerObject = {
            id: newPlayerId,
            x: xPos,
            y: yPos,
            invaderAvatarType: avatarTypes[randomAvatarSelector()], // get from db
            invaderAvatarColor: avatarColors[randomAvatarSelector()],
            direction: 0,
            score: 0,
            isAlive: true
        };

        players[newPlayerId] = newPlayerObject;
        subscribeToPlayerInput(playerChannels[newPlayerId], newPlayerId);
    }
}

const handlePlayerLeft = function (player) {
    let leavingPlayer = player.clientId;
    alivePlayers--;
    totalPlayers--;

    deadPlayersLeft = deadPlayers;

    deadPlayers = deadPlayers.filter((deadPlayer) => deadPlayer.id !== player.id);

    delete players[leavingPlayer];
    if (totalPlayers <= 0) {
        resetServerState();
    }

    // unsubscribe from players channel
    playerChannels[leavingPlayer].unsubscribe();
}

function resetServerState() {
    peopleAccessingTheWebsite = 0;
    gameOn = false;
    gameTickerOn = false;
    totalPlayers = 0;
    alivePlayers = 0;
    deadPlayers = [];
    spawnLocations = [{x: 1362.5, y: 712.5, occupied: false}, {x: 37.5, y: 712.5, occupied: false}, {
        x: 1362.5,
        y: 37.5,
        occupied: false
    }, {x: 37.5, y: 37.5, occupied: false}]

    deadPlayersLeft = []

    monsters = {
        "Ada": {x: 687.5, y: 362.5, direction: 1},
        "Johny": {x: 687.5, y: 362.5, direction: 1},
        "Clay": {x: 687.5, y: 362.5, direction: 1},
        "Ivan": {x: 687.5, y: 362.5, direction: 1},
        "Bob": {x: 687.5, y: 362.5, direction: 1}
    };

    boss = {x: 687.5, y: 362.5};

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

app.get("/getBoard", bodyParser.json(), (req, res) => res.json(walls))

app.get("/topScores", bodyParser.json(), (req, res) => {
    collection.find().project({
        username: 1,
        score: 1
    }).sort({score: -1}).limit(10).toArray().then(result => res.json(result))
})

app.get('/', ensureAuth, (req, res) => {
    res.sendFile(__dirname + "/views/home.html");
});

app.get('/login', ensureGuest, (req, res) => {
    res.sendFile(__dirname + "/views/login.html");
});

app.get('/game', ensureAuth, (req, res) => {
    peopleAccessingTheWebsite++;

    let personPlayedBefore = false;

    deadPlayersLeft.forEach((player) => {
        if (player.id === req.user) {
            console.log("dead player: ", player.id);
            console.log("user entering ", req.user);
            personPlayedBefore = true;
        }
    })


    if (peopleAccessingTheWebsite > MIN_PLAYERS_TO_START_GAME || personPlayedBefore) {
        res.sendFile(__dirname + "/views/gameRoomFull.html")
    } else {
        res.sendFile(__dirname + "/views/game.html");
    }
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


////////////////// A* stuff //////////////////

function findPathAStar(startGridNode, targetGridNode) {
    let frontier = new PriorityQueue();
    let cameFrom = {};
    let costSoFar = {};
    frontier.enqueue(startGridNode, 0);
    cameFrom[`${startGridNode.x}|${startGridNode.y}`] = "";
    costSoFar[`${startGridNode.x}|${startGridNode.y}`] = 0;

    while (!frontier.isEmpty()) {
        let currentGridNode = frontier.dequeue().element;
        let currentNodeId = `${currentGridNode.x}|${currentGridNode.y}`;

        // if the target nod was found, break
        if (currentGridNode.x === targetGridNode.x && currentGridNode.y === targetGridNode.y) {
            break;
        }

        // for every legal node current node has edge to:
        let legalNodes = getLegalGridConnections(currentGridNode);
        legalNodes.forEach(nextNode => {
            let nextNodeId = `${nextNode.x}|${nextNode.y}`;

            // calculate the cost of next node
            let newCost = costSoFar[currentNodeId] + cost(nextNode, currentGridNode);

            if (!costSoFar[nextNodeId] || newCost < costSoFar[nextNodeId]) {
                // update the cost of next node
                costSoFar[nextNodeId] = newCost;

                // calculate and update the priority of nextNode
                let priority = newCost + heuristic(nextNode, targetGridNode);
                frontier.enqueue(nextNode, priority);

                // keep track of where nodes come from
                // to generate the path to goal node
                cameFrom[nextNodeId] = currentNodeId;
            }
        })
    }

    return generatePath(startGridNode, targetGridNode, cameFrom);
}

function generatePath(startGridNode, targetGridNode, cameFrom) {
    let path = [];
    let currentId = `${targetGridNode.x}|${targetGridNode.y}`;

    path.unshift(targetGridNode)

    while (currentId !== `${startGridNode.x}|${startGridNode.y}`) {
        currentId = cameFrom[currentId];

        let coordArray = currentId.split("|");
        let node = {x: parseInt(coordArray[0]), y: parseInt(coordArray[1])}

        path.unshift(node)
    }

    return path;
}

function getLegalGridConnections(gridNode) {
    let legalNodes = [];

    if (walls[gridNode.y + 1][gridNode.x] !== 1) {
        legalNodes.push({x: gridNode.x, y: gridNode.y + 1})
    }
    if (walls[gridNode.y - 1][gridNode.x] !== 1) {
        legalNodes.push({x: gridNode.x, y: gridNode.y - 1})
    }
    if (walls[gridNode.y][gridNode.x + 1] !== 1) {
        legalNodes.push({x: gridNode.x + 1, y: gridNode.y})
    }
    if (walls[gridNode.y][gridNode.x - 1] !== 1) {
        legalNodes.push({x: gridNode.x - 1, y: gridNode.y})
    }

    return legalNodes;
}


function cost(currentLocation, nextLocation) {
    return Math.sqrt(Math.pow(currentLocation.x - nextLocation.x, 2) + Math.pow(currentLocation.y - nextLocation.y, 2));
}

function heuristic(currentLocation, goalLocation) {
    return Math.abs(goalLocation.x - currentLocation.x) + Math.abs(goalLocation.y - currentLocation.y);
}

// User defined class
// to store element and its priority
class QElement {
    constructor(element, priority) {
        this.element = element;
        this.priority = priority;
    }
}

// PriorityQueue class
class PriorityQueue {

    // An array is used to implement priority
    constructor() {
        this.items = [];
    }

    // enqueue function to add element
    // to the queue as per priority
    enqueue(element, priority) {
        // creating object from queue element
        let qElement = new QElement(element, priority);
        let contain = false;

        // iterating through the entire
        // item array to add element at the
        // correct location of the Queue
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > qElement.priority) {
                // Once the correct location is found it is
                // enqueued
                this.items.splice(i, 0, qElement);
                contain = true;
                break;
            }
        }

        // if the element have the highest priority
        // it is added at the end of the queue
        if (!contain) {
            this.items.push(qElement);
        }
    }

    // dequeue method to remove
    // element from the queue
    dequeue() {
        // return the dequeued element
        // and remove it.
        // if the queue is empty
        // returns null
        if (this.isEmpty())
            return null;
        return this.items.shift();
    }

    // front function
    front() {
        // returns the highest priority element
        // in the Priority queue without removing it.
        if (this.isEmpty())
            return null;
        let item = this.items[0];
        return item;
    }

    // rear function
    rear() {
        // returns the lowest priorty
        // element of the queue
        if (this.isEmpty())
            return null;
        return this.items[this.items.length - 1];
    }

    // isEmpty function
    isEmpty() {
        // return true if the queue is empty.
        return this.items.length === 0;
    }

    // printQueue function
    // prints all the element of the queue
    printPQueue() {
        let str = "";
        for (let i = 0; i < this.items.length; i++)
            str += this.items[i].element + " ";
        return str;
    }
}
