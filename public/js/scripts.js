console.log('pulled');

// create Phaser.Game object named "game"
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'my-game',
    { preload: preload, create: create, update: update });

// declare global variables for game


// preload game assets - runs once at start
function preload() {

}

// create game world - runs once after "preload" finished
function create() {

}

// update gameplay - runs in continuous loop after "create" finished
function update() {

}

// add custom functions (for collisions, etc.)