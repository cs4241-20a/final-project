let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
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
	})

	this.add.image(0, 0, 'sky').setOrigin(0, 0);
	scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#FFF'})

	platforms = this.physics.add.staticGroup();
    // player = this.physics.add.sprite(100, 450, 'char');
    stars = this.physics.add.group({
    	key: 'star', repeat: 11, setXY: {x: 12, y: 0, stepX: 70}
    });

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // player.setBounce(0.2);
    // player.setCollideWorldBounds(true);

    stars.children.iterate(child => child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)));

 //    this.anims.create({
	//     key: 'left',
	//     frames: this.anims.generateFrameNumbers('char', { start: 0, end: 3 }),
	//     frameRate: 10,
	//     repeat: -1
	// });

	// this.anims.create({
	//     key: 'turn',
	//     frames: [ { key: 'char', frame: 4 } ],
	//     frameRate: 20
	// });

	// this.anims.create({
	//     key: 'right',
	//     frames: this.anims.generateFrameNumbers('char', { start: 5, end: 8 }),
	//     frameRate: 10,
	//     repeat: -1
	// });

	this.physics.add.collider(stars, platforms);
	// this.physics.add.collider(player, platforms);
	// this.physics.add.overlap(player, stars, (player, star) => {
	// 	star.disableBody(true, true);
	// 	scoreText.setText('Score: ' + ++score);
	// }, null, this);
}


function update () {
	let cursors = this.input.keyboard.createCursorKeys();
	if (this.char){
		if (cursors.left.isDown) {
		    this.char.setVelocityX(-160);
		} else if (cursors.right.isDown) {
		    this.char.setVelocityX(160);
		} else {
		    this.char.setVelocityX(0);
		}

		if (cursors.up.isDown && this.char.body.touching.down){
		    this.char.setVelocityY(-330);
		}
	}
}

function addOtherPlayers(self, playerInfo) {
	let playerTwo = self.add.sprite(playerInfo.x, 450, 'main')
						  .setOrigin(0.5, 0.5)
						  .setDisplaySize(50, 80);
	
	// if (playerInfo.team === 'blue') {
	// 	otherPlayer.setTint(0x0000ff);
	// } else {
	// 	otherPlayer.setTint(0xff0000);
	// }
	self.physics.add.collider(playerTwo, platforms);
	
	playerTwo.playerId = playerInfo.playerId;
	self.otherPlayers.add(playerTwo);
}

function addPlayers(self, playerInfo) {
	self.char = self.physics.add.image(playerInfo.x, 450, 'main')
					.setOrigin(0.5, 0.5)
					.setDisplaySize(50, 80);
	// if (playerInfo.team === 'black')
		// self.char.setTint(0x585858);

	// self.char.setBounce(0.2);
    // self.char.setCollideWorldBounds(true);
	self.physics.add.collider(self.char, platforms);
    console.log('selfie', self.char);
}
