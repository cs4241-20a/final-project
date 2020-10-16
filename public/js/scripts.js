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
	this.load.spritesheet('char', '../assets/dude.png', {frameWidth: 32, frameHeight: 48});
}

function create () {
	this.add.image(0, 0, 'sky').setOrigin(0, 0);
	scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#FFF'})

	platforms = this.physics.add.staticGroup();
    player = this.physics.add.sprite(100, 450, 'char');
    stars = this.physics.add.group({
    	key: 'star', repeat: 11, setXY: {x: 12, y: 0, stepX: 70}
    });

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    stars.children.iterate(child => child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)));

    this.anims.create({
	    key: 'left',
	    frames: this.anims.generateFrameNumbers('char', { start: 0, end: 3 }),
	    frameRate: 10,
	    repeat: -1
	});

	this.anims.create({
	    key: 'turn',
	    frames: [ { key: 'char', frame: 4 } ],
	    frameRate: 20
	});

	this.anims.create({
	    key: 'right',
	    frames: this.anims.generateFrameNumbers('char', { start: 5, end: 8 }),
	    frameRate: 10,
	    repeat: -1
	});

	this.physics.add.collider(stars, platforms);
	this.physics.add.collider(player, platforms);
	this.physics.add.overlap(player, stars, (player, star) => {
		star.disableBody(true, true);
		scoreText.setText('Score: ' + ++score);
	}, null, this);
}


function update () {
	let cursors = this.input.keyboard.createCursorKeys();
	if (cursors.left.isDown) {
	    player.setVelocityX(-160);
	    player.anims.play('left', true);
	} else if (cursors.right.isDown) {
	    player.setVelocityX(160);
	    player.anims.play('right', true);
	} else {
	    player.setVelocityX(0);
	    player.anims.play('turn');
	}

	if (cursors.up.isDown && player.body.touching.down){
	    player.setVelocityY(-330);
	}
}

const loginProc = (json) => {
    console.log("user data", json);
    if (!json._id) return;

    document.getElementById("userInfo").setAttribute("style", "display:none");
    document.getElementById("profile").setAttribute("style", "");

    document.getElementById("loggedUsername").innerHTML = json.username;

    document.getElementById("loginPage").setAttribute("style", "display:none");
    document.getElementById("otherPages").setAttribute("style", "");

    fetch("/api/getData")
        .then((response) => response.json())
        .then((json) => dataParse(json));
};

const submit = function (e) {

    e.preventDefault();
  
    const task = document.querySelector("#task"),
      priority = document.querySelector("#priority"),
      json = { name: name.value, task: task.value, priority: priority.value },
      body = JSON.stringify(json);
  
    elementDisable();
    fetch("/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    })
      .then((response) => response.json())
      .then((json) => {
        
        dataParse(json);
        task.value = "";
        elementEnable();
      });
  
    return false;
  };

const logout = () => {
    fetch("/logout").then(() => {
        document.getElementById("userInfo").setAttribute("style", "");
        document.getElementById("profile").setAttribute("style", "display:none");

        document.getElementById("loggedUsername").innerHTML = "";

        document.getElementById("loginPage").setAttribute("style", "");
        document.getElementById("otherPages").setAttribute("style", "display:none");

        const items = document.getElementById("items");
        items.innerHTML = "";
    });
};

const login = () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                throw "Invalid Username/Passwword";
            }
            return response.json();
        })
        .then((json) => loginProc(json))
        .catch((err) => {
            console.error(err);
            alert(err);
        });
};

window.onload = function () {

    fetch("/api/getUser")
        .then(response => response.json())
        .then(json => loginProc(json));

    document.addEventListener("click", function (e) {
        if (e.target && e.target.getAttribute("id") == "loginButton") {
            login();
        }
        if (e.target && e.target.getAttribute("id") == "logoutButton") {
            logout();
        }
    });
};
