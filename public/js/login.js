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
    
}({'_id': 'mom', 'username': 'mom'});

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
