function loginProc (json) {
    console.log("user data", json);
    if (!json._id) return;

    document.getElementById("userInfo").setAttribute("style", "display:none");
    document.getElementById("profile").setAttribute("style", "");

    document.getElementById("loggedUsername").innerHTML = json.username;

    document.getElementById("loginPage").setAttribute("style", "display:none");
    document.getElementById("gamePage").setAttribute("style", "");
    
    if ( document.getElementById('my-game').innerHTML === "") {
	    game = new Phaser.Game(config);
    }

    fetch("/api/getHighScores")
        .then((response) => response.json())
        .then((json) => displayLeaderboard(json));
    
}({'_id': 'mom', 'username': 'mom'});


const displayLeaderboard = (json) => {
    const highScores = document.getElementById("highScores");
        highScores.innerHTML = "";

        json.forEach((highScore) => {
        
            highScores.innerHTML += `
            <tr>
              <td><h3 id="user-${highScore._id}">${highScore.user || "Unknown User"}</textarea>
              <td><h3 id="highScore-${highScore._id}" value=${highScore.score}></td>
            </tr>
            `;
        });
};

const submit = function (e) {

    e.preventDefault();
  
    const user = document.querySelector("#user"),
      score = document.querySelector("#priority"),
      json = { name: name.value, user: user.value, priority: priority.value },
      body = JSON.stringify(json);
  
    elementDisable();
    fetch("/editLeaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    })
      .then((response) => response.json())
      .then((json) => {
        
        user.value = "";
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
