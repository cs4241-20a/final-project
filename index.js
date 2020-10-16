var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io') (server);

var rooms = 0;

let SERVER_PORT = 6000;

app.use(express.static('.'));

app.get('/', function (req, res){
    res.sendFile(__dirname + '/game.html');
});

io.on('connection', function(socket){


      // Create a new game room and notify player 1
     socket.on('createGame', function(data){
         socket.join('room-' + ++rooms);
         socket.emit('newGame', {name: data.name, room: 'room-'+rooms, boardSize: data.boardSize});
     });


      // Connect player 2 to the requested room
      socket.on('joinGame', function(data){
          var room = io.nsps['/'].adapter.rooms[data.room];
          if (room && room.length == 1){
              socket.join(data.room);
			  socket.emit('player2', {name: data.name, room: data.room})
			  socket.broadcast.to(data.room).emit('sendPlayData', {room: data.room, name: data.name});
              socket.broadcast.to(data.room).emit('player1', {});              
          }
          else{
            
			  if(!room) {
				  socket.emit('err', {message: 'Room does not exist...' + data.room});
			  }
              if(room) {
				  socket.emit('err', {message: 'Room does not exist. ' + room.length});
			  }
          }
      });
  
	socket.on('playDataResponse', function(data) {
		socket.broadcast.to(data.room).emit('setVals', {room: data.room, boardSize: data.boardSize, name: data.name});

	});
      
  // Handle a player's turn and pass it to the other
       socket.on('playTurn', function(data){
           socket.broadcast.to(data.room).emit('turnPlayed', {
               tile: data.tile,
               room: data.room
           });
       });

  // Let the players know the winner
       socket.on('gameEnded', function(data){
           socket.broadcast.to(data.room).emit('gameEnd', data);
       });
});

const listener = server.listen(process.env.PORT, () => {
  console.log("Listening on port " + listener.address().port);
});