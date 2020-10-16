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
    //const button = document.getElementById("addTask");
    //button.onclick = submit;

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
