let currUsername = "";
let currUserID = "";

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

const socket = io('http://localhost:5000');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

appendMessage('You joined');

socket.on('chat-message', data => {
    appendMessage(data)
});

messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`You: ${message}`)
    const newmessage = currUsername + ": " + messageInput.value
    socket.emit('send-chat-message', newmessage)
    messageInput.value = ''
    while(messageContainer.childElementCount > 10) {
        messageContainer.removeChild(messageContainer.childNodes[0])
    }
})

function appendMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageContainer.append(messageElement)
    while(messageContainer.childElementCount > 10) {
        messageContainer.removeChild(messageContainer.childNodes[0])
    }
}

const submit = function (highScore) {

    const json = {user:{_id: currUserID, username: currUsername, highScore}};

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
        if (e.target && e.target.getAttribute("id") === "loginButton") {
            login();
        }
        if (e.target && e.target.getAttribute("id") === "logoutButton") {
            logout();
        }
    });
};
