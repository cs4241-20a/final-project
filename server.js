const http = require("http"),
  express = require("express"),
  ws = require("ws"),    
  app = express(),
  server = http.createServer(app),
  io = require("socket.io")(server),
  socketServer = new ws.Server({server}),    
  bodyParser = require("body-parser");

const NUM_ROWS = 5;
const NUM_COLUMNS = 5; 

//var lookingForPlayers = [] //list of usernames
let lookingForGame = [];
let clients = []; 
let usernames = [];

let games = [
  /*
  {
    playerOneName: String,
    playerOneSocket: Object,
    playerTwoName: String,
    playerTwoObject: Object,
    board: int[][]
  }
  */
];
  
server.listen(3000, () => {
  console.log("now listening");
});

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/gameBoard", (request, response) => {
  console.log("sending game board");
  response.setHeader("name", request.query.name);
  response.sendFile(__dirname + "/views/gameBoard.html");
});

app.post("/createGame", bodyParser.json(), function(request, response) {
  console.log("Incoming createGame request: " + JSON.stringify(request.body));
  response.status = 200;
});

app.post("/login", bodyParser.json(), function(request, response) {
  console.log("Incoming login request: " + JSON.stringify(request.body));
  response.status = 200;
  let username = request.body.username;
  for(let i = 0; i < usernames.length; i++){
    if(username === usernames[i]){
      response.status = 450;
      response.send("username already in use");
      return;
    }
  }
  usernames.push(username);
  response.send("");
});

app.post("/move", bodyParser.json(), function(request, response) {
  console.log("Incoming move request: " + JSON.stringify(request.body));
  response.status = 200;
  //executeMove(request.body.gameID, request.body.row, request.body.column, value)
});

/**
 * Executes a move in Connect Four for the game with the given gameID by
 * by placing a piece with the given value at the given row and column of
 * the game board. A message notifying clients of the new move is then
 * broadcast.
 * 
 * @param gameID the unique ID of the game where the move is taking place
 * @param row the row index (starting at 0) of where the new piece is being
 *   placed.
 * @param column the column index (starting at 0) of where the new piece is
 *   being placed.
 * @param value the value to place at the row column index of the game board
 *    value = 1 means the move was made by player 1, value = 2 for player 2.
 */
function executeMove(gameID, row, column, value){
  getBoard(gameID).then(result => {
    let board = result;
    let idx = (row * NUM_COLUMNS) + column;
    board[idx] = value;
    let win = false;//replace with function that checks for a win
    sendMove(row, column, value, win);//Send out to clients
    
    //Update the version of the board in the database
    updateBoard(gameID, board).then((error, result) => {
      if(error){
        console.log("Error occurred when updating the game board: " +error);
      }
    });
  });
}

/////////////////// Server to client communication /////////////////////
let count = 0

socketServer.on( 'connection', (client, request) => {
  let username = request.url.substring(7, request.url.length);//truly could not find a better way to do this, sorry :(
  let isReady = false;
  
  // when the server receives a message from this client...
  client.on( 'message', msg => {
    var json = JSON.parse(msg)
    
    //Take the proper action according to the subject lines
    if(json.subject === "logging in"){
      console.log("User " +json.username +" is logging in");
      if(lookingForGame.length > 0){
        //Someone else is looking for a game, group them together
        for(var i = 0; i < lookingForGame.length; i++){
          console.log(username + " found a player looking for game: " +lookingForGame[0].username)
          games.push({
            playerOneName: username,
            playerOneSocket: client,
            playerTwoName: lookingForGame[0].username,
            playerTwoSocket: lookingForGame[0].client,
            game: [
              [0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 0, 0],
            ],
          });
        }
        //Send message indicating to go to gameBoard.html
        client.send(JSON.stringify({subject: "game found"}));
        lookingForGame[0].client.send(JSON.stringify({subject: "game found"}));

        //Remove from waiting list
        lookingForGame.splice(0, 1);
      }else{
        //No one else is looking for a game, add to waiting list            
        lookingForGame.push({username:username, client: client});           
      }
      
    }else if(json.subject === "ready for game"){
      console.log("User " +json.username +" is ready for the game");
      updateSocket(username, client);
      let playerNumber = getPlayerNumber(username);
      if(playerNumber != -1){
        client.send(JSON.stringify({subject: "player number", message: playerNumber}));
        isReady = true;
      }
    }else if(json.subject === "chat message"){
      console.log("Received \"" +json.message +"\" from " +username +". Forwarding...");
      let otherSocket = getOtherPlayerSocket(username);
      if(otherSocket){  
        otherSocket.send(msg);
      }
    }else if(json.subject === "new move"){
      console.log("New move from " +username +". Forwarding...");
      let otherSocket = getOtherPlayerSocket(username);
      if(otherSocket){
        console.log("sending on socket: " +otherSocket);
        otherSocket.send(msg);
      }
    }
    else if(json.subject === "user disconnected"){
      let otherSocket = getOtherPlayerSocket(username);
      if(otherSocket && isReady){
        console.log("sending on socket: " +otherSocket);
        otherSocket.send(JSON.stringify({subject:"other player disconnected"}));
        console.log("TRYING TO CLOSE");
        deleteGame(username);
        //TODO: go to home page after alert
      }
    }
  });
  
  client.on("close", event => {
      let otherSocket = getOtherPlayerSocket(username);
      if(otherSocket && isReady){
        console.log("sending on socket: " +otherSocket);
        otherSocket.send(JSON.stringify({subject:"other player disconnected"}));
        console.log("TRYING TO CLOSE");
        deleteGame(username);
        //TODO: go to home page after alert
      }
    }
  )
  
  //Handle any errors that occur.
  client.on("error", error => {
      console.log("An error occured at client socket: " +error);
  })

  // add client to client list
  clients.push( client )
  
  
})

function getOtherPlayerSocket(username){
  for(let i = 0; i < games.length; i++){
    if(games[i].playerOneName === username){
      console.log("Sending message from " +games[i].playerOneName +" to " +games[i].playerTwoName);
      return games[i].playerTwoSocket;
    }else if(games[i].playerTwoName === username){
      console.log("Sending message from " +games[i].playerTwoName +" to " +games[i].playerOneName);
      return games[i].playerOneSocket;
    }
  }
  return null; //Game for current player was not found
}

function updateSocket(username, socket){
  for(let i = 0; i < games.length; i++){
    if(games[i].playerOneName === username){
      games[i].playerOneSocket = socket;
      return true;
    }else if(games[i].playerTwoName === username){
      games[i].playerTwoSocket = socket;
      return true;
    }
  }
  console.log("Unable to update socket");
  return false;
}

function getPlayerNumber(username){
  for(let i = 0; i < games.length; i++){
    if(username === games[i].playerOneName){
      return 1;
    }else if(username === games[i].playerTwoName){
      return 2;
    }
  }
  return -1;
}

function deleteGame(username){
  for(let i = 0; i < games.length; i++){
    if(games[i].playerOneName === username || games[i].playerTwoName === username){
      console.log("Removing game for " +username +" at index " +i);
      games.splice(i, 1);
    }
  }
}