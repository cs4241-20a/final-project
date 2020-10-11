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
const PLAYER_MOVEMENT_INCREMENT = 10;
const PLAYER_VERTICAL_MOVEMENT_UPDATE_INTERVAL = 1000;
const PLAYER_SCORE_INCREMENT = 5;
const P2_WORLD_TIME_STEP = 1 / 16;
const OTHER_AXIS_RANGE = 20;
const SAME_AXIS_RANGE = 10;
const MIN_PLAYERS_TO_START_GAME = 2;
const GAME_TICKER_MS = 1000;

let peopleAccessingTheWebsite = 0;
let players = {};
let deadPlayers = {};
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
        if (msg.data.keyPressed === "left") { // direction is East
            players[playerId].direction = 4;

            if (players[playerId].x - PLAYER_MOVEMENT_INCREMENT < PLAYER_MOVEMENT_INCREMENT) {
                players[playerId].x = PLAYER_MOVEMENT_INCREMENT;

            } else {
                players[playerId].x -= PLAYER_MOVEMENT_INCREMENT;
            }

        } else if (msg.data.keyPressed === "right") { // direction is West
            players[playerId].direction = 2;

            if (players[playerId].x + PLAYER_MOVEMENT_INCREMENT > CANVAS_WIDTH) {
                players[playerId].x = CANVAS_WIDTH;

            } else {
                // players[playerId].x += CANVAS_WIDTH;
                players[playerId].x += PLAYER_MOVEMENT_INCREMENT;
            }

        } else if (msg.data.keyPressed === "up") { // direction is North
            players[playerId].direction = 1;

            if (players[playerId].y + PLAYER_MOVEMENT_INCREMENT < PLAYER_MOVEMENT_INCREMENT) {
                players[playerId].y = PLAYER_MOVEMENT_INCREMENT;
            } else {
                // players[playerId].x += CANVAS_HEIGHT;
                players[playerId].y -= PLAYER_MOVEMENT_INCREMENT;
            }

        } else if (msg.data.keyPressed === "down") { // direction is South
            players[playerId].direction = 3;


            if (players[playerId].y + PLAYER_MOVEMENT_INCREMENT > CANVAS_HEIGHT) {
                players[playerId].y = CANVAS_HEIGHT;
            } else {
                players[playerId].y += PLAYER_MOVEMENT_INCREMENT;
            }
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
        let tryDirection = player.direction

        let previousX = player.x;
        let previousY = player.y;
        let movementDirection = (tryDirection === 1 || tryDirection === 3) ? 0 : 1;

        if (player.isAlive === false) {
            //delete players[player.id]
            console.log("FOUND DEAD PLAYER: " + player.id);
        }
        // can move in the current direction
        if (player.isAlive !== false && canMove(tryDirection, player.id)) {
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
        
        console.log( "My player " + player.id + " updated position: x = " + player.x + ", y = " + player.y )
    })


    // check if player picked a coin


    // check if players die
}


function checkRange(positionVal, minimalRange, maxRange, constant) {
    if ( (positionVal >= (minimalRange - constant)) &&
        (positionVal <= (maxRange + constant)) ) 
    {
        return true;

    }  

    return false;
}


function checkIfDead(id, minRange, maxRange, otherAxisVal, direction) {
    let inRange = false;
    let currentPlayerDead = false;

    Object.values(players).forEach(function (player) {
        if (player.id !== id) {
            // direction was vertical (SAME AXIS WOULD BE Y-AXIS)
            if (direction === 0) {
                
                if ( checkRange(player.y, minRange, maxRange, SAME_AXIS_RANGE) &&
                    checkRange(player.x, otherAxisVal, otherAxisVal, OTHER_AXIS_RANGE) )
                {
                    inRange = true;
                }

            } else { // direction was horizontal (SAME AXIS WOULD BE X-AXIS)

                if ( checkRange(player.x, minRange, maxRange, SAME_AXIS_RANGE) &&
                    checkRange(player.y, otherAxisVal, otherAxisVal, OTHER_AXIS_RANGE) )
                {
                    inRange = true;
                }
            }

            if (inRange) {
                player.isAlive = false;
                deadPlayers[player.id] = player;
                delete players[player.id];
            }
        }  
    })

    if (currentPlayerDead) {
        players[id].isAlive = false;
        deadPlayers[id] = players[id];
        delete players[id];
    }
}


function withinBoundary(x, y) {
    if (x >= 0 && x <= CANVAS_WIDTH) {
        if (y >= 0 && y <= CANVAS_HEIGHT) {
            return true;
        }
    }

    return false;
}

// check if a player's move would be valid
// check against game boundaries
// TODO: CHECK AGAINST WALLS
function canMove(direction, id) {

    if (players[id] === null) {
        return false;
    }

    let positionX = players[id].x;
    let positionY = players[id].y;

    if (direction === 1) { // direction is North
        positionY -= PLAYER_MOVEMENT_INCREMENT;


    } else if (direction === 2) { // direction is East
        positionX += PLAYER_MOVEMENT_INCREMENT;

    } else if (direction === 3) { // direction is South
        positionY += PLAYER_MOVEMENT_INCREMENT;

    } else if (direction === 4) { // direction is West
        positionX -= PLAYER_MOVEMENT_INCREMENT;
    }

    if (!withinBoundary(positionX, positionY)) {
        console.log("Error! That would be outside of the boundary. X: " + positionX + ", Y: " + positionY)
        return false;
    
    } else {
        return true
    }

    // checking if wall is present
    // if( walls[positionX][positionY] === 1 ){
    //     console.log( "There is a wall here" )
    //     return false;
    // }

    // TODO: check the map array if the current postionX and positionY is at a wall or a player
}

const startGameDataTicker = function () {
    let tickInterval = setInterval(() => {
        if (!gameTickerOn) {
            clearInterval(tickInterval);
        } else {
            // move every player
            moveEveryPlayer();
            // check player dead

            gameRoom.publish("game-state", {
                players: players,
                playerCount: totalPlayers,
                gameOn: gameOn,
                deadPlayers: deadPlayers,
                coins: {},
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
        direction: 1,
        score: 0,
        nickname: player.data,
        isAlive: true
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

app.get("/getBoard", bodyParser.json(), (req, res) => res.json(walls))
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
