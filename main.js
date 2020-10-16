(function(){
    // Types of players
    var P1 = 'X', P2 = 'O';
	let SERVER_PORT = 6000;
	let waiting = true;
    var socket = window.ws = io(`${window.location.host}`),
    player,
    game;
	let N_SIZE = 3;
	let maxPrev = N_SIZE-1;
	let blockForReception = true;
    var Player = function(name, type){
        this.name = name;
        this.type = type;
        this.currentTurn = true;
    }

    Player.prototype.setCurrentTurn = function(turn){
        this.currentTurn = turn;
        if(turn){
            $('#turn').text('Player Turn');
        }
        else{
            $('#turn').text('Opponent Turn');
        }
    }

    Player.prototype.getPlayerName = function(){
        return this.name;
    }

    Player.prototype.getPlayerType = function(){
        return this.type
    }

    Player.prototype.getCurrentTurn = function(){
        return this.currentTurn;
    }

    /**
     *  Game class
     */
    var Game = function(roomID){
        this.roomId = roomID;
        this.board = [];
        this.moves = 0;
    }

  
    // Create the Game board by attaching event listeners to the buttons
    Game.prototype.createGameBoard = function(){
		let arr = [];
		for(var i = 0; i < N_SIZE; i++) {
			arr.push("");
		}
    for(var i = 0; i < N_SIZE; i++){
			switch (N_SIZE) {
				case 3:
					this.board.push(['', '', '']);
					break;
				case 4:
					this.board.push(['', '', '', '']);
					break;
				case 5:
					this.board.push(['', '', '', '', '']);
					break;
				case 6:
					this.board.push(['', '', '', '', '', '']);
					break;
				case 7:
					this.board.push(['', '', '', '', '', '', '']);
					break;
				case 8:
					this.board.push(['', '', '', '', '', '', '', '']);
					break;
				case 9:
					this.board.push(['', '', '', '', '', '', '', '', '']);
					break;
				default:
					this.board.push(['', '', '']);
					break;
			}
            for (var j = 0; j < N_SIZE; j++){
                $('#button_' + i + '' + j).on('click', function(){
                    if(!player.getCurrentTurn()){
                        alert('Not your turn!');
                        return;
                    }
					
					var row = parseInt(this.id.split('_')[1][0]);
                    var col = parseInt(this.id.split('_')[1][1]);
					if(waiting) {
						alert('Waiting for player!');
						return;
					}
          if($(this).prop('disabled')) {
						alert("Can't overwrite tile.");
						return;
					}
                    game.playTurn(this);
                    game.updateBoard(player.getPlayerType(), row, col, this.id);

                    player.setCurrentTurn(false);

                    game.checkWinner();
                    return false;
                });
            }
        }
    }

  // Function to display the board
    Game.prototype.displayBoard = function(message){
        $('.menu').css('display', 'none');
        $('.gameBoard').css('display', 'block');
        $('#userHello').html(message);
        this.createGameBoard();
    }

  // Function to update the board
    Game.prototype.updateBoard = function(type, row, col, tile){
      console.log(tile);
		  var element = document.getElementById(tile);
      let fSize = 0;
      if(N_SIZE > 5) {
        fSize = 120/N_SIZE;
      } else {
        fSize = 240/N_SIZE;
      }
       element.innerHTML = "<p style='font-size: " + fSize + "px;'>" + type + "</p><br />"
      
        $('#'+tile).prop('disabled', true);
        this.board[row][col] = type;
        this.moves++;
    }

    Game.prototype.getRoomId = function(){
        return this.roomId;
    }

     //  Send an update to the opponent to update their UI
    Game.prototype.playTurn = function(tile){
        var clickedTile = $(tile).attr('id');
        var turnObj = {
            tile: clickedTile,
            room: this.getRoomId()
        };
        // Emit an event to update other player that you've played your turn
        socket.emit('playTurn', turnObj);
    }
	
     Game.prototype.checkWinner = function(){
		 let prev = 0;
		 let prevType = 0;
       
		 // Check for horizontal victory
		 console.log("Game board height: " + game.board.length);
		 console.log("Game board width: " + game.board[0].length);
		 maxPrev = N_SIZE - 1;
		 var suc = false;
		 for(let i = 0; i < N_SIZE; i++) {
			 for(let j = 0; j < N_SIZE; j++) {
				 let curType = game.board[i][j];
				 if(curType == prevType && (prevType == P1 || prevType == P2)) {
					 prev++;
				 } else {
					prev = 0;
					prevType = curType;
				 }
				 
				 if(prev >= maxPrev) {
					 suc = true;
					game.announceWinner();
				 }
			 }
			 
	
			 prev = 0;
			 prevType = 0;
		 }
       
		 // Check for vertical victory
		 for(let i = 0; i < N_SIZE; i++) {
			 for(let j = 0; j < N_SIZE; j++) {
				 let curType = game.board[j][i];
				 if(curType == prevType && (prevType == P1 || prevType == P2)) {
					 prev++;
				 } else {
					prev = 0;
					prevType = curType;
				 }
				  if(prev >= maxPrev) {
					  suc = true;
					game.announceWinner();
				 }
			 }
			
			 prev = 0;
			 prevType = 0;
		 }
       
		 // Check for diagonal victory (top left to bottom right)
		 for(let i = 0; i < N_SIZE - maxPrev; i++) {
			 for(let j = i; j < N_SIZE; j++) {
				 let curType = game.board[j][j];
				 if(curType == prevType && (prevType == P1 || prevType == P2)) {
					 prev++;
				 } else {
					prev = 0;
					prevType = curType;
				 }
				 if(prev >= maxPrev) {
					 suc = true;
					game.announceWinner();
					console.log("Winner: " + prevType);
				 }
				 console.log("ForDiag");
				 console.log("PrevType: " + prevType);
				 console.log("Prev: " + prev);
				 console.log("curType: " + curType);
				 console.log("i: " + i);
				 console.log("j: " + j);
			 }
			 
			 prev = 0;
			 prevType = 0;
		 }
     // Check for diagonal victory (top right to bottom left)
		 for(let i = N_SIZE - 1; i > maxPrev - 1; i--) {
			 for(let j = i; j >= 0; j--) {
				 let curType = game.board[i-j][j];
				 if(curType == prevType && (prevType == P1 || prevType == P2)) {
					 prev++;
				 } else {
					prev = 0;
					prevType = curType;
				 }
				 if(prev >= maxPrev) {
					 suc = true;
					game.announceWinner();
					console.log("Winner: " + prevType);
				 }
				 console.log("BackDiag");
				 console.log("PrevType: " + prevType);
				 console.log("Prev: " + prev);
				 console.log("curType: " + curType);
				 console.log("i: " + i);
				 console.log("j: " + j);
			 }
			
			 prev = 0;
			 prevType = 0;
		 }

         var tied = this.moves >= N_SIZE * N_SIZE;
         if(tied && !suc){
             socket.emit('gameEnded', {room: this.getRoomId(), message: 'Tie'});
             alert('Tie');
             location.reload();
         }
     }

     Game.prototype.announceWinner = function(){
         var message = player.getPlayerName() + ' wins!';
         socket.emit('gameEnded', {room: this.getRoomId(), message: message});
         alert(message);
         location.reload();
     }

     Game.prototype.endGame = function(message){
         alert(message);
         location.reload();
     }

    $('#new').on('click', function(){
        var name = $('#nameNew').val();
		var bSize = $('#boardSize').val();
		console.log("bSize: "  + bSize);
        if(!name){
            alert('Please enter your name.');
            return;
        }
		if(bSize < 3 || bSize > 9) {
			alert('Invalid board size, must be 3-9');
			return;
		}
        socket.emit('createGame', {name: name, boardSize: bSize});
		N_SIZE = bSize;
		maxPrev = N_SIZE - 1;
        player = new Player(name, P1);
    });


    $('#join').on('click', function(){
        var name = $('#nameJoin').val();
        var roomID = $('#room').val();
        if(!name || !roomID){
            alert('Please enter your name and room number.');
            return;
        }
        socket.emit('joinGame', {name: name, room: roomID});
        player = new Player(name, P2);
    });

    socket.on('newGame', function(data){
        var message = '<br>Hello, ' + data.name +
        '.<br> Game ID: ' +
        data.room + '. Waiting...';
		waiting = true;
		let size = data.boardSize;
		console.log("board size: " + data.boardSize);
		N_SIZE = size;
		maxPrev = N_SIZE - 1;
		init();
		
        game = new Game(data.room, data.boardSize);
		
        game.displayBoard(message);
		document.getElementById("sel").innerHTML = "";
    });
	socket.on('sendPlayData', function(data) {
		socket.emit('playDataResponse', {boardSize: N_SIZE, room: data.room, name: data.name});
		waiting = false;
		console.log("Size requested, is " + N_SIZE);
	});
	
	socket.on('setVals', function(data){
		let message = "Guest: " + data.name;
		console.log("Received final size: " + data.boardSize);
		N_SIZE = data.boardSize;
		maxPrev = N_SIZE - 1;
		blockForReception = false;
		waiting = false;
		init();
		document.getElementById("sel").innerHTML = "";
    
        // Create game for player 2
        game = new Game(data.room);
        game.displayBoard(message);
        player.setCurrentTurn(false);
    });
  
	let playTMessage = "";
    socket.on('player1', function(data){
        var playMessage = '<br>Host: ' + player.getPlayerName();
		waiting = false;
		document.getElementById("sel").innerHTML = "";
        $('#userHello').html(playMessage);
		
        player.setCurrentTurn(true);
    });

    socket.on('player2', function(data){
        var playTMessage = "<br>Guest: " + data.name;
    });

    socket.on('turnPlayed', function(data){
        var row = data.tile.split('_')[1][0];
        var col = data.tile.split('_')[1][1];
        var opponentType = player.getPlayerType() == P1 ? P2 : P1;
        game.updateBoard(opponentType, row, col, data.tile);
        player.setCurrentTurn(true);
    });

    socket.on('gameEnd', function(data){
        game.endGame(data.message);
        socket.leave(data.room);
		blockForReception = true;
    })

    socket.on('err', function(data){
        game.endGame(data.message);
    });
	var EMPTY = '&nbsp;',
	  boxes = [],
	  score,
	  moves;
	
	 // Initializes the Tic Tac Toe 
	function init() {
	  var board = document.createElement('table');
	  board.setAttribute('border', 1);
	  board.setAttribute('cellspacing', 0);
    board.setAttribute('table-layout', 'fixed');
	  var identifier = 1;
	  for (var i = 0; i < N_SIZE; i++) {
		var row = document.createElement('tr');
		board.appendChild(row);
		for (var j = 0; j < N_SIZE; j++) {
		  var cell = document.createElement('td');
		  cell.setAttribute('height', 360/N_SIZE);
		  cell.setAttribute('width', 360/N_SIZE);
		  cell.setAttribute('align', 'center');
		  cell.setAttribute('valign', 'center');
		  cell.setAttribute('font-size', (360/N_SIZE) + "px");
		  cell.setAttribute('id', 'button_' + i + j);
		  cell.classList.add('tile');
		  row.appendChild(cell);
		  boxes.push(cell);
		}
	}

	  document.getElementById('tictactoe').appendChild(board);
	}
}) ();