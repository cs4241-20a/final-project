let gameRoom;
let myClientId;
let myChannel;
let gameOn = false;
let players = {};
let totalPlayers = 0;
let amIalive = false;
let game;

let monsters = {}

let backendCoins = null;
let clientCoins = {};
let prevKey = "";
let board = []; // init
const RATIO = 25;

const BASE_SERVER_URL = "https://pac-people.herokuapp.com";
let myNickname = "";

const realtime = Ably.Realtime({
    authUrl: "/auth/game",
});

realtime.connection.once("connected", () => {
    myClientId = realtime.auth.clientId;
    myNickname = realtime.auth.clientId;
    gameRoom = realtime.channels.get("game-room");
    myChannel = realtime.channels.get("clientChannel-" + myClientId);
    gameRoom.presence.enter(myNickname);
    game = new Phaser.Game(config);
});

class Explosion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "explosion");
        scene.add.existing(this);
        this.play("explode");
    }
}


class GameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }


    //load assets
    preload() {
        this.load.spritesheet(
            "avatarA",
            "/assets/avatarA.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarB",
            "/assets/avatarB.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarC",
            "/assets/avatarC.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarAgreen",
            "/assets/avatarAgreen.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarAcyan",
            "/assets/avatarAcyan.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarAyellow",
            "/assets/avatarAyellow.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarBgreen",
            "/assets/avatarBgreen.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarBcyan",
            "/assets/avatarBcyan.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarByellow",
            "/assets/avatarByellow.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarCgreen",
            "/assets/avatarCgreen.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarCcyan",
            "/assets/avatarCcyan.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarCyellow",
            "/assets/avatarCyellow.png",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "explosion",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2Fexplosion57%20(2).png?v=1589491279459",
            {
                frameWidth: 48,
                frameHeight: 48
            }
        );
        this.load.image("wall", "/assets/wall_actual.png");

        this.load.spritesheet(
            "coin",
            "/assets/coin_actual.png", {
                frameWidth: 25,
                frameHeight: 25
            }
        )

        this.load.spritesheet(
            "Ada",
            "/assets/monsterOne.png", {
                frameWidth: 25,
                frameHeight: 25
            }
        )

        //load board
        fetch("/getBoard", {headers: {'Content-Type': 'application/json'}})
            .then((response) => response.json())
            .then((walls) => board = walls);
    }

    //init variables, define animations & sounds, and display assets
    create() {
        this.monsterAvatars = {};
        this.avatars = {};
        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.anims.create({
            key: "explode",
            frames: this.anims.generateFrameNumbers("explosion"),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });

        this.renderBoardAndCoins();


        gameRoom.subscribe("game-state", (msg) => {
            if (msg.data.gameOn) {
                gameOn = true;
            }
            players = msg.data.players;
            totalPlayers = msg.data.playerCount;
            backendCoins = msg.data.coins;
            monsters = msg.data.monsters;
        });

        gameRoom.subscribe("game-over", (msg) => {
            gameOn = false;
            gameRoom.unsubscribe();
            myChannel.unsubscribe();
            //window.location.replace(BASE_SERVER_URL + "/");
        });
    }

    //update the attributes of various game objects per game logic
    update() {
        let scores = [];

        for (let item in this.avatars) {
            if (!players[item]) {
                this.avatars[item].destroy();
                delete this.avatars[item];
            }
        }

        for (let item in players) {

            let avatarId = players[item].id;
            if (this.avatars[avatarId] && players[item].isAlive) {
                // render position of the avatar to match player's

                this.avatars[avatarId].x = players[item].x;
                this.avatars[avatarId].y = players[item].y;

                scores.push({id: players[item].id, score: players[item].score})
            } else if (!this.avatars[avatarId] && players[item].isAlive) {

                // initialize the avatar on client side
                if (players[item].id !== myClientId) {

                    // if this is another user's avatar, get its color
                    let avatarName =
                        "avatar" +
                        players[item].invaderAvatarType +
                        players[item].invaderAvatarColor;
                    this.avatars[avatarId] = this.physics.add
                        .sprite(players[item].x, players[item].y, avatarName)
                        .setOrigin(0.5, 0.5);
                    this.avatars[avatarId].setCollideWorldBounds(true);
                } else if (players[item].id === myClientId) {

                    // if it's our avatar, color it with default (white)
                    let avatarName = "avatar" + players[item].invaderAvatarType;
                    this.avatars[avatarId] = this.physics.add
                        .sprite(players[item].x, players[item].y, avatarName)
                        .setOrigin(0.5, 0.5);
                    this.avatars[avatarId].setCollideWorldBounds(true);
                    amIalive = true;
                }
            } else if (this.avatars[avatarId] && !players[item].isAlive) {
                // player died

                console.log("death");

                this.explodeAndKill(avatarId);

                if (players[item].id === myClientId) {
                    amIalive = false;
                }
            }
        }

        for (let monsterId in monsters) {

            if (this.monsterAvatars[monsterId]) {
                // update monsters positions
                this.monsterAvatars[monsterId].x = ((monsters[monsterId].x + 1) * RATIO) - Math.floor(RATIO / 2);
                this.monsterAvatars[monsterId].y = ((monsters[monsterId].y + 1) * RATIO) - Math.floor(RATIO / 2);
            } else if (!this.monsterAvatars[monsterId]) {
                // init monster
                this.monsterAvatars[monsterId] = this.physics.add
                    .sprite(((monsters[monsterId].x + 1) * RATIO) - Math.floor(RATIO / 2), ((monsters[monsterId].y + 1) * RATIO) - Math.floor(RATIO / 2), monsterId)
                    .setOrigin(0.5, 0.5);

                this.monsterAvatars[monsterId].setCollideWorldBounds(true);
            }
        }

        this.updateCoinsOnClient()
        this.updateScores(scores);
        this.publishMyInput();
    }

    updateCoinsOnClient() {
        // scale user's x and y
        if (backendCoins != null) {
            for (let item in clientCoins) {
                if (!backendCoins[item]) {
                    // coin has been picked
                    clientCoins[item].disableBody(true, true);
                    delete clientCoins[item];
                }
            }
        }
    }

    explodeAndKill(deadPlayerId) {
        this.avatars[deadPlayerId].disableBody(true, true);
        let explosion = new Explosion(
            this,
            this.avatars[deadPlayerId].x,
            this.avatars[deadPlayerId].y
        );
        delete this.avatars[deadPlayerId];
    }

    publishMyInput() {
        if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.left) && amIalive && prevKey !== "left") {
            myChannel.publish("pos", {
                keyPressed: "left",
            });
            prevKey = "left";
        } else if (
            Phaser.Input.Keyboard.JustDown(this.cursorKeys.right) &&
            amIalive && prevKey !== "right"
        ) {
            myChannel.publish("pos", {
                keyPressed: "right",
            });
            prevKey = "right";
        } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.down) &&
            amIalive && prevKey !== "down") {
            myChannel.publish("pos", {
                keyPressed: "down",
            });
            prevKey = "down";
        } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.up) &&
            amIalive && prevKey !== "up") {
            myChannel.publish("pos", {
                keyPressed: "up",
            });
            prevKey = "up";
        }
    }

    updateScores(scores) {
        scores.sort((a, b) => a.score < b.score);
        let displayStr = "";

        scores.forEach((item) => {
            displayStr += "'" + item.id + " : " + item.score + "' ";
        })

        document.getElementById("score").innerText = displayStr;
    }

    renderBoardAndCoins() {
        for (let i = 0; i < board[0].length; i++) {
            for (let j = 0; j < board.length; j++) {
                // console.log(`${i} : ${j}`);
                if (board[j][i] === 1) {
                    this.physics.add.image(((i + 1) * RATIO) - Math.floor(RATIO / 2), ((j + 1) * RATIO) - Math.floor(RATIO / 2), "wall", null, {
                        restitution: 0.4,
                        isStatic: true
                    });
                } else if (board[j][i] === 0) {
                    let x = i
                    let y = j
                    if (x < 10) {
                        x = `0${x}`
                    }

                    if (y < 10) {
                        y = `0${y}`
                    }

                    let id = `${x}|${y}`

                    clientCoins[id] = this.physics.add
                        .sprite(((i + 1) * RATIO) - Math.floor(RATIO / 2), ((j + 1) * RATIO) - Math.floor(RATIO / 2), "coin")
                        .setOrigin(0.5, 0.5);
                }
            }
        }
    }
}

const config = {
    width: 1400,
    height: 750,
    backgroundColor: "#FFFFF",
    parent: "gameContainer",
    scene: [GameScene],
    physics: {
        default: "arcade"
    }
};
