let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
	parent: 'my-game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

let player, platforms, stars, scoreText, score = 0;

function preload () {
	this.load.image('sky', '../assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('main', 'assets/main.png');
	// this.load.spritesheet('char', '../assets/dude.png', {frameWidth: 32, frameHeight: 48});
}

function create () {
	let self = this;

	this.otherPlayers = this.physics.add.group();
	
	this.socket = io();

	this.socket.on('currentPlayers', players => {
		Object.keys(players).forEach(id => {
			if (players[id].playerId === self.socket.id) {
				addPlayers(self, players[id]);
			} else {
				addOtherPlayers(self, players[id])
			}
		});
	});

	this.socket.on('newPlayer', player => {
		addOtherPlayers(self, player);
	});

	this.socket.on('disconnect', playerId => {
		self.otherPlayers.getChildren().forEach(child => {
			if (playerId === child.playerId)
				child.destroy();
		})
	});

	this.socket.on('playerMoved', playerInfo => {
		console.log(playerInfo);
		self.otherPlayers.getChildren().forEach(player => {
			if (playerInfo.playerId === player.playerId){
				player.setPosition(playerInfo.x, playerInfo.y);
			}
		});
	});

	this.add.image(0, 0, 'sky').setOrigin(0, 0);
	scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#FFF'})

	platforms = this.physics.add.staticGroup();

    stars = this.physics.add.group({
    	key: 'star', repeat: 11, setXY: {x: 12, y: 0, stepX: 70}
    });

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    stars.children.iterate(child => child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)));

	this.physics.add.collider(stars, platforms);
}


function update () {
	let cursors = this.input.keyboard.createCursorKeys();

	let char = this.char;

	if (char){
		if (cursors.left.isDown) {
		    char.setVelocityX(-160);
		} else if (cursors.right.isDown) {
		    char.setVelocityX(160);
		} else {
		    char.setVelocityX(0);
		}

		if (cursors.up.isDown && char.body.touching.down){
		    char.setVelocityY(-330);
		}

		if (char.oldPosition && (char.x !== char.oldPosition.x || char.y !== char.oldPosition.y)){
			this.socket.emit('playerMovement', {x: char.x, y: char.y});
		}

		char.oldPosition = {
			x: char.x,
			y: char.y
		};
	}
}

function addOtherPlayers(self, playerInfo) {
	let playerTwo = self.add.image(playerInfo.x, playerInfo.y, 'main')
						  .setOrigin(0.5, 0.5)
						  .setDisplaySize(50, 80);
	
	playerTwo.setTint(playerInfo.team);
	self.physics.add.collider(playerTwo, platforms);
	
	playerTwo.playerId = playerInfo.playerId;
	self.otherPlayers.add(playerTwo);
}

function addPlayers(self, playerInfo) {
	self.char = self.physics.add.image(playerInfo.x, playerInfo.y, 'main')
					.setOrigin(0.5, 0.5)
					.setDisplaySize(50, 80);
	
	self.char.setTint(playerInfo.team);
	self.char.setBounce(0.2);
    self.char.setCollideWorldBounds(true);
	self.physics.add.collider(self.char, platforms);

	self.physics.add.overlap(self.char, stars, (player, star) => {
		star.disableBody(true, true);
		scoreText.setText('Score: ' + ++score);
	}, null, self);
}
