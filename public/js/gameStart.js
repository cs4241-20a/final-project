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
    scene: [Lobby, DinoGame]
};

let game = new Phaser.Game(config);