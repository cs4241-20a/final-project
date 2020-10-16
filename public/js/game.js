let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
	parent: 'my-game', // parent div
    physics: {
        default: 'arcade', // physics enging
        arcade: {
            gravity: {y: 300},
            debug: true // puts boxes around everything for collisions
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

let game = new Phaser.Game(config);

// global vars for the player
let platforms, stars, scoreText, keyboard, score = 0;

// loads in all the assets
function preload () {
	this.load.image('sky', '../assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('main', 'assets/main.png');
}

// called to add all the assets to the actual game
function create () {
	let self = this; // to store the current context

	this.otherPlayers = this.physics.add.group(); // hold a group of game objects inside phaser
	
	this.socket = io(); // assign the io to socket

	// recieved when first connecting to the server so you get positions and colors of all current players
	this.socket.on('currentPlayers', players => {
		Object.keys(players).forEach(id => { // loops through those players
			if (players[id].playerId === self.socket.id) { // if that player is this client, run func
				addPlayers(self, players[id]);
			} else {
				addOtherPlayers(self, players[id]) //  all other players get this function
			}
		});
	});

	// if a new player joins the server
	this.socket.on('newPlayer', player => {
		addOtherPlayers(self, player);
	});

	// if someone disconnects
	this.socket.on('disconnect', playerId => {
		self.otherPlayers.getChildren().forEach(child => {
			if (playerId === child.playerId)
				child.destroy();
		})
	});

	// called whenever the server says someone moved
	this.socket.on('playerMoved', playerInfo => {
		self.otherPlayers.getChildren().forEach(player => {
			if (playerInfo.playerId === player.playerId){
				player.setPosition(playerInfo.x, playerInfo.y);
			}
		});
	});

	// add the sky background
	this.add.image(0, 0, 'sky').setOrigin(0, 0);
	scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#FFF'}) // adds the score Text (top left)

	platforms = this.physics.add.staticGroup(); // adds the platforms as a non moving (static) group

	// adds the stars in a movable group with different starting coordinates (70px away in the x)
    stars = this.physics.add.group({
    	key: 'star', repeat: 11, setXY: {x: 12, y: 0, stepX: 70}
    });

    // creates all the platforms for the game
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // add random bounce amounts to each star
    stars.children.iterate(child => child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)));

    // make stars collide with platforms
	this.physics.add.collider(stars, platforms);

	// get keyboard vals
	keyboard = this.input.keyboard.createCursorKeys();
}


function update () {
	let char = this.char;

	// different controls to control our own character
	if (char){
		if (keyboard.left.isDown) {
		    char.setVelocityX(-160);
		} else if (keyboard.right.isDown) {
		    char.setVelocityX(160);
		} else {
		    char.setVelocityX(0);
		}

		// jump
		if (keyboard.up.isDown && char.body.touching.down){
		    char.setVelocityY(-330);
		}

		// if the current position is new, it is broadcasted to all other clients using the server
		if (char.oldPosition && (char.x !== char.oldPosition.x || char.y !== char.oldPosition.y)){
			this.socket.emit('playerMovement', {x: char.x, y: char.y});
		}

		// saving the current position
		char.oldPosition = {
			x: char.x,
			y: char.y
		};
	}
}

// adding other players into our game
function addOtherPlayers(self, playerInfo) {
	// assigning them as an image and placing them in the correct spot
	let playerTwo = self.add.image(playerInfo.x, playerInfo.y, 'main')
						  .setOrigin(0.5, 0.5)
						  .setDisplaySize(50, 80);
	
	playerTwo.setTint(playerInfo.team); // setting their color
	self.physics.add.collider(playerTwo, platforms); // making sure their image can stand on platforms
	
	playerTwo.playerId = playerInfo.playerId; 
	self.otherPlayers.add(playerTwo); // adding this new player to our catalog
}

// adding ourself to the world
function addPlayers(self, playerInfo) {
	// adding ourself as an image instead of a sprite
	self.char = self.physics.add.image(playerInfo.x, playerInfo.y, 'main')
					.setOrigin(0.5, 0.5)
					.setDisplaySize(50, 80);
	
	self.char.setTint(playerInfo.team);
	self.char.setBounce(0.2); // making sure we bounce correctly
    self.char.setCollideWorldBounds(true); // not allowed to leave the stage
	self.physics.add.collider(self.char, platforms);

	// collision with a star, also changes scores and removes the star
	self.physics.add.overlap(self.char, stars, (player, star) => {
		star.disableBody(true, true);
		scoreText.setText('Score: ' + ++score);
	}, null, self);
}
