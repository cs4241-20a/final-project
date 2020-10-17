let currUsername = "";
let currUserID = "";
let index = 0;

const displayLeaderboard = (json) => {
    const highScores = document.getElementById("highScores");
        highScores.innerHTML = "";
        
        json.forEach((user) => {
                highScores.innerHTML += `
                <tr>
                  <td><h3 style="text-align:center" id="user-${user._id}">${user.username || "Unknown User"}</td>
                  <td><h3 style="text-align:center" id="highScore-${user._id}">${user.highScore || 0}</td> 
                </tr>
                `;
        });
};

function loginProc (json) {
    console.log("user data", json);
    if (!json._id) return;

    currUsername = json.username;
    currUserID = json._id;

    document.getElementById("userInfo").setAttribute("style", "display:none");
    document.getElementById("profile").setAttribute("style", "");

    document.getElementById("loggedUsername").innerHTML = currUsername;

    document.getElementById("loginPage").setAttribute("style", "display:none");
    document.getElementById("gamePage").setAttribute("style", "");
    
    if ( document.getElementById('my-game').innerHTML === "") {
	    game = new Phaser.Game(config);
    }

    submit();

    
    
};

const submit = function () {
    
    const json = {user:{_id: currUserID, username: currUsername, highScore: 50 + Math.floor(Math.random()*50)}};
    
    console.log(json);

    fetch("/setHighScore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body:JSON.stringify(json),
    })
      .then((response) => {
          fetch("/api/getAllUsers")
            .then((response) => response.json())
            .then((json) => displayLeaderboard(json));

      });
  
    return false;
  };

const logout = () => {
    fetch("/logout").then(() => {
        document.getElementById("userInfo").setAttribute("style", "");
        document.getElementById("profile").setAttribute("style", "display:none");

        document.getElementById("loggedUsername").innerHTML = "";

        document.getElementById("loginPage").setAttribute("style", "");
        document.getElementById("gamePage").setAttribute("style", "display:none");

        game.destroy(true, false);

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
