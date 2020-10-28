
console.log("hello world :o");



var animate = window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement('canvas');
var width = 400;
var height = 600;

var playerX = 0;
var computerX = 0;

var p2Ballx = 0;
var p2Bally = 0;

var currPointHome = 0;
var currPointAway = 0;


canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var playerNumber = 0;

var leftDiv = document.getElementById('left') // For putting the game above
var startBtn = document.getElementById('start')



//***************************player select socket*******************
const firstws = new WebSocket("ws://localhost:6969");

firstws.addEventListener("open", () => {
  //console.log("connected");

  firstws.addEventListener("message", something=>{

    //console.log(something.data);
    let obj1 = JSON.parse(something.data);

    let x = obj1['PlayerNum'];

    //console.log("x:" + x);
    
    if(x == 1){
      playerNumber = 1;
    } else if(x == 2){
      playerNumber = 2;
    }
    //console.log("Player Number: " + playerNumber);


    firstws.close();
  }); 
  


});

function timeout() {
  setTimeout(function () {
  }, 5000);
}

timeout();

//*******************Game socket************************
const ws = new WebSocket("ws://localhost:3030");


ws.addEventListener("message", e=>{

  //console.log(e.data);
  let obj1 = JSON.parse(e.data);

  let x = obj1['ComputerX'];
  let p2bx = obj1['BallX'];
  let p2by = obj1['BallY'];
    //console.log(x);
    computerX = x;
    p2Ballx = 400 - p2bx;
    p2Bally = 600 - p2by;
  }); 



ws.addEventListener("open", () => {
  //console.log("connected");

  let firstmsg = {
    PlayerX: player.paddle.x
  }
  
  ws.send(JSON.stringify(firstmsg));

  

  

});




start.addEventListener("click", function() {
  leftDiv.appendChild(canvas);
  animate(step);
  getItems(playerNumber);
  start.remove();
})

var step = function() {

  update();
  render();
  animate(step);
};

var update = function() {
};

var render = function() {
  context.fillStyle = "#FF00FF";
  context.fillRect(0, 0, width, height);
};


function Paddle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.x_speed = 0;
  this.y_speed = 0;
}

Paddle.prototype.render = function() {
  context.fillStyle = "#0ff";
  context.fillRect(this.x, this.y, this.width, this.height);
};


function Player() {
 this.paddle = new Paddle(175, 580, 50, 10);
}

function Computer() {
  this.paddle = new Paddle(175, 10, 50, 10);
}


Player.prototype.render = function() {
  this.paddle.render();
};

Computer.prototype.render = function() {
  this.paddle.render();
};

function Ball(x, y) {
  this.x = x;
  this.y = y;
  this.x_speed = 0;
  this.y_speed = 3;
  this.radius = 5;
}

Ball.prototype.render = function() {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = "#FFF";
  context.fill();
};


var player = new Player();
var computer = new Computer();
var ball = new Ball(200, 300);

var render = function() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);
  player.render();
  computer.render();
  ball.render();
};

var update = function() {
  ball.update();
};

Ball.prototype.update = function() {
  this.x += this.x_speed;
  this.y += this.y_speed;
};

var update = function() {
  ball.update(player.paddle, computer.paddle);
};

Ball.prototype.update = function(paddle1, paddle2, bx, by) {

  if(playerNumber == 2){
    if(by <= 0){
      addScore(2, 1);
    }

    this.x = bx;
    this.y = by;
   



} else {
 this.x += this.x_speed;
 this.y += this.y_speed;
 var top_x = this.x - 5;
 var top_y = this.y - 5;
 var bottom_x = this.x + 5;
 var bottom_y = this.y + 5;




  if(this.x - 5 < 0) { // hitting the left wall
    this.x = 5;
    this.x_speed = -this.x_speed;
  } else if(this.x + 5 > 400) { // hitting the right wall
    this.x = 395;
    this.x_speed = -this.x_speed;
  }

  if(this.y < 0) { // a point was scored
    addScore(1, 1);
    currPointAway = 0;
    currPointHome = 0;
    this.x_speed = 0;
    this.y_speed = 3;
    this.x = 200;
    this.y = 300;
    
    
  }

  if(this.y > 600){
    this.x_speed = 0;
    this.y_speed = 3;
    this.x = 200;
    this.y = 300;
    
  }

  if(top_y > 300) {
    if(top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
      // hit the player's paddle
      this.y_speed = -3;
      this.x_speed += (paddle1.x_speed / 2);
      this.y += this.y_speed;
      currPointHome++;
    }
  } else {
    if(top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
      // hit the computer's paddle
      this.y_speed = 3;
      this.x_speed += (paddle2.x_speed / 2);
      this.y += this.y_speed;
    }
  }
}

};

var keysDown = {};

window.addEventListener("keydown", function(event) {
  keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
});


var update = function() {
  player.update();
  ball.update(player.paddle, computer.paddle);
};

Player.prototype.update = function() {
  for(var key in keysDown) {
    var value = Number(key);
    if(value == 37) { // left arrow
      this.paddle.move(-4, 0);
    } else if (value == 39) { // right arrow
      this.paddle.move(4, 0);
    } else {
      this.paddle.move(0, 0);
    }
  }
};

Paddle.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  this.x_speed = x;
  this.y_speed = y;
  if(this.x < 0) { // all the way to the left
    this.x = 0;
    this.x_speed = 0;
  } else if (this.x + this.width > 400) { // all the way to the right
    this.x = 400 - this.width;
    this.x_speed = 0;
  }
}


var update = function() {
  player.update();
  ball.update(player.paddle, computer.paddle, p2Ballx, p2Bally);
  computer.update(computerX);

  let msg = {
    PlayerNum: playerNumber,
    PlayerX: player.paddle.x,
    BallX: ball.x,
    BallY: ball.y
  }

  ws.send(JSON.stringify(msg));
  


};

Computer.prototype.update = function(newx) {
  computerX = newx;
  this.paddle.x = newx;
};


//*****************database stuff*********

let user = "testuser"; //this will be the user's username. Replace dynamically with login


const scoresList = document.getElementById("scores");



//Score MUST be taken in as string
function addScore(playerNum, theScore){
  fetch("/add", {
    method: "POST",
    body: JSON.stringify({ score: theScore, PlayerNum: playerNum }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(response => response.json())
  .then(res => clearList())
  .then(res2 => getItems(playerNum))
}

//Add score to list helper function:
function appendNewScore(score, id) {
  const newListItem = document.createElement("li");
  newListItem.innerText = score;
  scoresList.appendChild(newListItem);
  newListItem.onclick = function() {
    deleteItem(id);
    newListItem.remove();
  }
}

//Delete Function:
function deleteItem(id) {
  fetch("/delete", {
    method: "POST",
    body: JSON.stringify({ id }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(response => response.json())
  .then(json => {});
}

//Get scores from server
function getItems(playerNum) {
  fetch("/items", {
    method: "POST",
    body: JSON.stringify({ PlayerNum: playerNum }),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json()) // parse the JSON from the server
    .then(scores => {
      // remove the loading text

      console.log("Items in database:");
      console.log(scores);
      for (var i = 0; i < scores.length; i++) {
        appendNewScore(scores[i].score, scores[i]._id);
      }
    });
  }

//Clear the ul list
function clearList(){
  scoresList.innerHTML = "";
}


