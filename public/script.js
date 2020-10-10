let gameRoom;
let myClientId;
let myChannel;
let gameOn = false;
let players = {};
let totalPlayers = 0;
let amIalive = false;
let game;
let coins = null;
let clientCoins = {};
let prevKey = "";
let board = []; // init

const BASE_SERVER_URL = "http://localhost:4000";
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
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FInvaderA_00%402x.png?v=1589228669385",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarB",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FInvaderB_00%402x.png?v=1589228660870",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarC",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FInvaderC_00%402x.png?v=1589228654058",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarAgreen",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderAgreen.png?v=1589839188589",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarAcyan",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderAcyan.png?v=1589839190850",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarAyellow",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderAyellow.png?v=1589839197191",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarBgreen",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderBgreen.png?v=1589839187283",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarBcyan",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderBcyan.png?v=1589839193162",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarByellow",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderByellow.png?v=1589839195096",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarCgreen",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderCgreen.png?v=1589839203129",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarCcyan",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderCcyan.png?v=1589839200959",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "avatarCyellow",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderCyellow.png?v=1589839198988",
            {
                frameWidth: 25,
                frameHeight: 25
            }
        );
        this.load.spritesheet(
            "explosion",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2Fexplosion57%20(2).png?v=1589491279459",
            {
                frameWidth: 25,
                frameHeight: 25
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

        //load board
        fetch("/getBoard", {headers: {'Content-Type': 'application/json'}})
            .then((response) => response.json())
            .then((walls) => board = walls);
    }

    //init variables, define animations & sounds, and display assets
    create() {
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
            coins = msg.data.coins;
        });

        gameRoom.subscribe("game-over", (msg) => {
            gameOn = false;
            localStorage.setItem("totalPlayers", msg.data.totalPlayers);
            localStorage.setItem("winner", msg.data.winner);
            gameRoom.unsubscribe();
            myChannel.unsubscribe();
            if (msg.data.winner == "Nobody") {
                window.location.replace(BASE_SERVER_URL + "/gameover");
            } else {
                window.location.replace(BASE_SERVER_URL + "/winner");
            }
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

        this.updateCoinsOnClient();
        this.updateScores(scores);
        this.publishMyInput();
    }

    updateCoinsOnClient() {
        // make sure they were initialized
        if (coins != null) {
            for (let item in clientCoins) {
                // if such coin is not on server side anymore
                if (!coins[item]) {
                    // coin was picked
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
        let ratio = 25;

        console.log(board.length); // 30 // 56

        for (let i = 0; i < board[0].length; i++) {
            for (let j = 0; j < board.length; j++) {
                // console.log(`${i} : ${j}`);
                if (board[j][i] === 1) {
                    this.physics.add.image(((i + 1) * ratio) - Math.floor(ratio / 2), ((j + 1) * ratio) - Math.floor(ratio / 2), "wall", null, {
                        restitution: 0.4,
                        isStatic: true
                    });
                } else if (board[j][i] === 0) {
                    let coinId = `${i}|${j}`;

                    clientCoins[coinId] = this.physics.add
                        .sprite(((i + 1) * ratio) - Math.floor(ratio / 2), ((j + 1) * ratio) - Math.floor(ratio / 2), "coin")
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
