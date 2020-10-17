class Lobby extends Phaser.Scene {// global vars for the player
	// let platforms, stars, scoreText, keyboard, score = 0;

	constructor(){
		super('Lobby');
		this.platforms, this.stars, this.scoreText, this.keyboard, this.ready, this.score = 0;
	}

	// loads in all the assets
	preload () {
		this.load.image('sky', 'assets/sky.png');
	    this.load.image('ground', 'assets/platform.png');
	    this.load.image('star', 'assets/star.png');
	    this.load.image('main', 'assets/main.png');
	    // this.load.image('ready', 'assets/readyBut.png');
	}

	// called to add all the assets to the actual game
	create () {
		let self = this; // to store the current context

		this.otherPlayers = this.physics.add.group(); // hold a group of game objects inside phaser
		
		this.socket = io(); // assign the io to socket

		// recieved when first connecting to the server so you get positions and colors of all current players
		this.socket.on('currentPlayers', players => {
			Object.keys(players).forEach(id => { // loops through those players
				if (players[id].playerId === self.socket.id) { // if that player is this client, run func
					this.addPlayers(self, players[id]);
				} else {
					this.addOtherPlayers(self, players[id]) //  all other players get this function
				}
			});
		});

		// if a new player joins the server
		this.socket.on('newPlayer', player => {
			this.addOtherPlayers(self, player);
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

		this.socket.on('startGame', () => this.switchScenes());

		// add the sky background
		this.add.image(0, 0, 'sky').setOrigin(0, 0);
		this.scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#fff'}) // adds the score Text (top left)

		this.platforms = this.physics.add.staticGroup(); // adds the platforms as a non moving (static) group

		// adds the stars in a movable group with different starting coordinates (70px away in the x)
	    this.stars = this.physics.add.group({
	    	key: 'star', repeat: 11, setXY: {x: 12, y: 0, stepX: 70}
	    });

	    // creates all the platforms for the game
	    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
	    this.platforms.create(600, 400, 'ground');
	    this.platforms.create(50, 250, 'ground');
	    this.platforms.create(750, 220, 'ground');

	    // ready button
	    // this.ready = this.add.sprite(40, 50, 'ready').setInteractive();
	    // this.ready.on('pointerdown', () => {console.log('we ready');});
	    this.ready = this.add.text(700, 560, 'Not Ready', {fontFamily: 'Roboto', color: '#fff', backgroundColor: '#C42953'}).setInteractive();
	    this.ready.on('pointerdown', () => {
	    	this.ready.setText('Ready')
			    	  .setBackgroundColor('#28CA4A')
			    	  .setColor('#000');
			this.socket.emit('ready');
	    });

	    // add random bounce amounts to each star
	    this.stars.children.iterate(child => child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)));

	    // make stars collide with platforms
		this.physics.add.collider(this.stars, this.platforms);

		// get keyboard vals
		this.keyboard = this.input.keyboard.createCursorKeys();
	}

	// called like every game tick
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
		console.log(self.char.body)
		// collision with a star, also changes scores and removes the star
		self.physics.add.overlap(self.char, this.stars, (player, star) => {
			star.disableBody(true, true);
			this.scoreText.setText('Score: ' + ++this.score);
			// if (this.stars.countActive(true) === 0)
			self.switchScenes();
			
		}, null, self);
	}

	switchScenes() {
		console.log('starting');
		this.socket.off('currentPlayers');
		this.socket.off('newPlayer');
		this.socket.off('disconnect');
		this.socket.off('playerMoved');
		this.socket.off('startGame');
		// this.socket.leave();
		this.scene.start('DinoGame');
	}
}