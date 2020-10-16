let username;
let socket;
var currentBoard = [
  //currentBoard[5][6] is the bottom right of the board
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
];

var thisPlayer = 1; //if the player is player one or player two, player one moves first
var currentTurn = 1;
let numRows = currentBoard.length,
  numCols = currentBoard[0].length;

function loadGameBoardPg() {
  console.log("Loading: " + window.location);
  username = window.location.search.substring(6, window.location.search.length);
  console.log("Entering game board with username: " + username);

  //buildBoard();

  let sendForm = document.getElementById("sendMessage");
  sendForm.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage();
  });

  socket = new WebSocket(`wss://${window.location.host}?name=${username}`);
  //Notify server that you're now ready to play. This wll also allow the server
  //to record the new socket to use for communication.
  socket.onopen = () => {
    socket.send(JSON.stringify({ subject: "ready for game", username }));
  };

  //Handle chat messages
  socket.onmessage = event => {
    console.log(
      username + " has an incoming message from server: " + event.data
    );
    var json = JSON.parse(event.data);
    if (json.subject === "chat message") {
      updateChat(json.name, json.message);
      
    } else if (json.subject === "player number") {
      thisPlayer = Number(json.message);
      console.log("Setting player number to: " + thisPlayer);
      let playerLabel = document.getElementById("playerLabel");
      if (thisPlayer == 1) {
        playerLabel.innerHTML = "Your color: Red";
      } else {
        playerLabel.innerHTML = "Your color: Yellow";
      }
      
    } else if (json.subject === "new move") {
      console.log("New move from other user");
      var opponent = 2;
      if (thisPlayer === 2) {
        opponent = 1;
      }
      updateBoard(json.row, json.column, opponent);
      
      console.log("win is set to: " +json.win);
      if(json.win == 3){
        document.getElementById("title").innerHTML = "Tie!"
        let playerTurn = document.getElementById("playerTurn");
        playerTurn.style.display = "none"
      }else if(json.win != 0){
        playerWon(false)
      }
      
    } else if (json.subject === "other player disconnected") {
      console.log("OTHER USER DISCONNECTED!!!");
      alert("Other user disconnected. Returning to home page.");
      window.location = "/";
    }
  };

  var btn1 = document.getElementById("1");
  btn1.onclick = function() {
    sendMove(0);
  };

  var btn2 = document.getElementById("2");
  btn2.onclick = function() {
    sendMove(1);
  };

  var btn3 = document.getElementById("3");
  btn3.onclick = function() {
    sendMove(2);
  };

  var btn4 = document.getElementById("4");
  btn4.onclick = function() {
    sendMove(3);
  };

  var btn5 = document.getElementById("5");
  btn5.onclick = function() {
    sendMove(4);
  };

  var btn6 = document.getElementById("6");
  btn6.onclick = function() {
    sendMove(5);
  };

  var btn7 = document.getElementById("7");
  btn7.onclick = function() {
    sendMove(6);
  };
  
  var btnBack = document.getElementById("back");
  btnBack.onclick = function() {
    if (socket) {
      //socket is only initialized if client is currently in a game
      console.log("going back");
      socket.send(
        JSON.stringify({ subject: "user disconnected"})
      );
    }
    window.location = "/";
  };
}

function updateBoard(row, column, player) {
  console.log("Updating board...");

  //update whose turn it is
  let playerTurn = document.getElementById("playerTurn");
  if (currentTurn === 1) {
    currentTurn = 2;
    playerTurn.innerHTML = "Make Your Move: Yellow"
  } else {
    currentTurn = 1;
    playerTurn.innerHTML = "Make Your Move: Red"
  }

  currentBoard[row][column] = player;

  buildBoard();

  console.log(currentBoard);
}

function playerWon(won){
  if(won){
      document.getElementById("title").innerHTML = "You Won!"
  }
  else{
    document.getElementById("title").innerHTML = "You Lost!"
  }
  let playerTurn = document.getElementById("playerTurn");
  playerTurn.style.display = "none"
  playerTurn.style.display = "none"

  disableButtons()
}

function disableButtons(){
    var btn1 = document.getElementById("1");
  btn1.onclick = function() {
    
  };

  var btn2 = document.getElementById("2");
  btn2.onclick = function() {
    
  };

  var btn3 = document.getElementById("3");
  btn3.onclick = function() {
    
  };

  var btn4 = document.getElementById("4");
  btn4.onclick = function() {
    
  };

  var btn5 = document.getElementById("5");
  btn5.onclick = function() {
    
  };

  var btn6 = document.getElementById("6");
  btn6.onclick = function() {
    
  };

  var btn7 = document.getElementById("7");
  btn7.onclick = function() {
    
  };
  
}

//gets column and finds row with no token
//updates users board and sends move to opponent
function sendMove(column) {
  console.log("sending move" + column);
  if (currentTurn === thisPlayer && validMove(column)) {
    var row = currentBoard.length - 1;
    //find row
    for (var i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i][column] != 0) {
        row = i - 1;
        break;
      }
    }
    
    updateBoard(row, column, thisPlayer);
    let win = checkWin(row, column);
    let isFull = isBoardFull();
    if(isFull){
      document.getElementById("title").innerHTML = "Tie!"
      let playerTurn = document.getElementById("playerTurn");
      playerTurn.style.display = "none"  
      
      disableButtons()
      win = 3;//tie
    }

    if (socket) {
      //socket is only initialized if client is currently in a game
      console.log("sending move");
      socket.send(
        JSON.stringify({ subject: "new move", row: row, column: column, win: win })
      );
    }
    else{
      console.log("socket not connected")
    }
      
  } else { 
    console.log("not your turn / invalid move");
  }
}

function validMove(column) {
  for (let i = 0; i < currentBoard.length; i++) {
    if (currentBoard[i][column] === 0) {
      return true; //Found an empty space in this column
    }
  }
  return false;
}

// Check if either of the players have won yet.
// returns 0 for no winner, 1 for player 1, 2 for player 2.
function checkWin(row, column) {

  // check for horizontal win condition
  for (let i = 0; i < numRows; i++) {
    let count = 0;
      
    for (let j = 0; j < numCols; j++) {
      let currentPiece = currentBoard[i][j];
      if (currentPiece === thisPlayer) {
        count++;
      } else {
        count = 0;
      }
      if (count >= 4) {
        playerWon(true)
        return thisPlayer;
      }
    }
  }

  // check for vertical win condition
  for (let j = 0; j < numCols; j++) {
    let count = 0;
    
    for (let i = 0; i < numRows; i++) {
      let currentPiece = currentBoard[i][j];
      if (currentPiece === thisPlayer) {
        count++;
      } else {
        count = 0;
      }
      if (count >= 4) {
        playerWon(true)
        return thisPlayer;
      }
    }
  }

  // check for diagonal win condition
  // top left -> bottom right
  for (let i = 0; i < 3; i++) {
    let count = 0;
    let row, col;
    for (row = i, col = 0; row < numRows && col < numCols; row++, col++) {
      if (currentBoard[row][col] == thisPlayer) {
        count++;
        if (count >= 4) {
          playerWon(true)
          return thisPlayer;
        }
      } else {
        count = 0;
      }
    }
  }
  for (let i = 1; i < 4; i++) {
    let count = 0;
    let row, col;
    for (row = 0, col = i; row < numRows && col < numCols; row++, col++) {
      if (currentBoard[row][col] == thisPlayer) {
        count++;
        if (count >= 4) {
          playerWon(true)
          return thisPlayer;
        }
      } else {
        count = 0;
      }
    }
  }
  // top right -> bottom left
  for (let i = 0; i < 5; i++) {
    let count = 0;
    let row, col;
    for (row = i, col = 6; row < numRows && col > 0; row++, col--) {
      if (currentBoard[row][col] == thisPlayer) {
        count++;
        if (count >= 4) {
          playerWon(true)
          return thisPlayer;
        }
      } else {
        count = 0;
      }
    }
  }
  for (let i = 1; i < 6; i++) {
    let count = 0;
    let row, col;
    for (row = 0, col = i; row < numRows && col < numCols; row++, col--) {
      if (currentBoard[row][col] == thisPlayer) {
        count++;
        if (count >= 4) {
          playerWon(true)
          return thisPlayer;
        }
      } else {
        count = 0;
      }
    }
  }

  // no win
  return 0;
}

function sendMessage() {
  console.log("in sendMessage");
  let newMessageBox = document.getElementById("message");
  let newMessage = newMessageBox.value;
  if (newMessage && newMessage !== "") {
    //Add to our own chat box
    updateChat(username, newMessage);

    //Send to server so it can forward it to the other player
    socket.send(
      JSON.stringify({
        subject: "chat message",
        name: username,
        message: newMessage
      })
    );

    //Clear out message box for the next one
    newMessageBox.value = "";
  }
}

function updateChat(name, message) {
  let chatBox = document.getElementById("chatBox");
  let newMessage = document.createElement("p");
  //newMessage.class = "has-text-left has-text-black";
  newMessage.style =
    "display: block; color: black; margin: 0px 0px 0px 5px; text-align: left;";
  newMessage.innerHTML = `${name}: ${message}`;
  chatBox.prepend(newMessage);
}

function buildBoard() {
  let board = document.getElementById("gameBoard");
  //let footer = board.getElementsByTagName("tfoot")[0];
  //board.removeChild(footer);
    board.style = 'background-color: #f5f0f0; color: #363636; border-collapse: inherit;'
  let oldBody = board.getElementsByTagName("tbody")[0];
  let newBody = document.createElement("tbody");
  board.replaceChild(newBody, oldBody);
  //board.append(footer);

  for (let i = 0; i < 6; i++) {
    let newRow = newBody.insertRow();
    newRow.insertCell(0).style = `height: 35px; border-radius:50%; background-color: ${getPieceColor(currentBoard[i][0])};`
    newRow.insertCell(1).style = `height: 35px; border-radius:50%; background-color: ${getPieceColor(currentBoard[i][1])};`
    newRow.insertCell(2).style = `height: 35px; border-radius:50%; background-color: ${getPieceColor(currentBoard[i][2])};`
    newRow.insertCell(3).style = `height: 35px; border-radius:50%; background-color: ${getPieceColor(currentBoard[i][3])};`
    newRow.insertCell(4).style = `height: 35px; border-radius:50%; background-color: ${getPieceColor(currentBoard[i][4])};`
    newRow.insertCell(5).style = `height: 35px; border-radius:50%; background-color: ${getPieceColor(currentBoard[i][5])};`
    newRow.insertCell(6).style = `height: 35px; border-radius:50%; background-color: ${getPieceColor(currentBoard[i][6])};`
  }
}

function getPieceColor(playerNumber){
  if(playerNumber === 0){
    return "white";
  }else if(playerNumber === 1){
    return "red";
  }else if(playerNumber === 2){
    return "yellow";
  }
}

// returns true if board is full,
// false otherwise.
function isBoardFull(){
  let full = true;
  for(let i=0;i<currentBoard.length;i++){
    if(currentBoard[i].includes(0)){
      full = false;
    }
  }
    
  return full;
}

