class DinoGame extends Phaser.Scene {// global vars for the player
	// let platforms, stars, scoreText, keyboard, score = 0;

	constructor(){
		super('DinoGame');
		this.platforms, this.stars, this.scoreText, this.keyboard, this.score = 0;
	}


	// loads in all the assets
	preload () {
		console.log('preloaded');
		this.load.image('space', '../assets/deep-space.jpg');
	    this.load.image('cactus', 'assets/platform.png');
	    this.load.image('fireball', 'assets/fireball.png');
	}

	// called to add all the assets to the actual game
	create () {
		let self = this; // to store the current context

		this.otherPlayers = this.physics.add.group(); // hold a group of game objects inside phaser
		
		this.socket = io(); // assign the io to socket

		// // recieved when first connecting to the server so you get positions and colors of all current players
		// this.socket.on('gamePlayers', players => {
		// 	Object.keys(players).forEach(id => { // loops through those players
		// 		if (players[id].playerId === self.socket.id) { // if that player is this client, run func
		// 			this.addPlayers(self, players[id]);
		// 		} else {
		// 			this.addOtherPlayers(self, players[id]) //  all other players get this function
		// 		}
		// 	});
		// });

		// if someone disconnects
		this.socket.on('disconnect', playerId => {
			let children = self.otherPlayers;
			if (children) {
				children.getChildren().forEach(child => {
					if (playerId === child.playerId)
						child.destroy();
				});
			}
		});

		// called whenever the server says someone moved
		this.socket.on('playerMoved', playerInfo => {
			let children = self.otherPlayers;
			if (children) {
				children.getChildren().forEach(player => {
					if (playerInfo.playerId === player.playerId){
						player.setPosition(playerInfo.x, playerInfo.y);
					}
				});
			}
		});

		// add the space background	
		let background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'space');
		background.setScale(Math.floor(Math.max(this.cameras.main.width * 1.15 / background.width, this.cameras.main.height / background.height) * 10) / 10);

		this.scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#FFF'}) // adds the score Text (top left)

		this.platforms = this.physics.add.staticGroup(); // adds the platforms as a non moving (static) group

		// adds the stars in a movable group with different starting coordinates (70px away in the x)
	    this.stars = this.physics.add.group({
	    	key: 'star', repeat: 11, setXY: {x: 12, y: 0, stepX: 70}
	    });

	    // creates all the platforms for the game
	    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

	    // add random bounce amounts to each star
	    this.stars.children.iterate(child => child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)));

		this.obstacles = this.physics.add.group();
		this.obstacles.create(Phaser.Math.Between(40, 750), 0, 'fireball').setScale(2).refreshBody();
		this.obstacles.children.iterate(child => {
			child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
			child.setVelocityX(Phaser.Math.Between(-20, -40));
			child.setGravityX(Phaser.Math.FloatBetween(2, 4));
		});

	    // make stars collide with platforms
		this.physics.add.collider(this.stars, this.platforms);

		// make comet disappear
	    this.physics.add.overlap(this.obstacles, this.platforms, (obstacle, platform) => {
	    	obstacle.destroy();
	    });

		this.addPlayers(self, 'vagina');
		// get keyboard vals
		this.keyboard = this.input.keyboard.createCursorKeys();
	}


	update () {
		let char = this.char;

		// different controls to control our own character
		if (char){
			if (this.keyboard.left.isDown) {
			    char.setVelocityX(-160);
			} else if (this.keyboard.right.isDown) {
			    char.setVelocityX(160);
			} else {
			    char.setVelocityX(0);
			}

			// jump
			if (this.keyboard.up.isDown && char.body.touching.down){
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
	addOtherPlayers(self, playerInfo) {
		// assigning them as an image and placing them in the correct spot
		let playerTwo = self.add.image(playerInfo.x, playerInfo.y, 'main')
							  .setOrigin(0.5, 0.5)
							  .setDisplaySize(50, 80);
		
		playerTwo.setTint(playerInfo.team); // setting their color
		self.physics.add.collider(playerTwo, this.platforms); // making sure their image can stand on platforms
		
		playerTwo.playerId = playerInfo.playerId; 
		self.otherPlayers.add(playerTwo); // adding this new player to our catalog
	}

	// adding ourself to the world
	addPlayers(self, playerInfo) {
		// adding ourself as an image instead of a sprite
		self.char = self.physics.add.image(playerInfo.x, playerInfo.y, 'main')
						.setOrigin(0.5, 0.5)
						.setDisplaySize(50, 80);
		
		self.char.setTint(playerInfo.team);
		self.char.setBounce(0.2); // making sure we bounce correctly
	    self.char.setCollideWorldBounds(true); // not allowed to leave the stage
		self.physics.add.collider(self.char, this.platforms);

		// collision with a star, also changes scores and removes the star
		self.physics.add.overlap(self.char, this.stars, (player, star) => {
			star.disableBody(true, true);
			this.scoreText.setText('Score: ' + ++this.score);
		}, null, self);
	}

}