let socket;

// define variables that reference elements on our page
var loginForm = document.getElementById("loginForm");

function loadLoginPg() {
  loginForm = document.getElementById("loginForm");

  // listen for the form to be submitted and add a new dream when it is
  loginForm.addEventListener("submit", event => {
    console.log("trying to login");
    // stop our form submission from refreshing the page
    event.preventDefault();

    var currentUser = document.getElementById("username").value;
    console.log(currentUser);

    fetch("/login", {
      method: "POST",
      body: JSON.stringify({ username: currentUser}),
      headers: {
        "Content-Type": "application/json"
      }
    }).then(response => {
      //window.location = response.url;
      //currentUser = response.username;
      if(response.status === 200){
        document.getElementById("submit-username").disabled = true
        document.getElementById("submit-username").opacity = 0.3
        
        console.log("Successfully logged in as:",currentUser)
        alert("Successfully logged in! Finding you a game...");
      

        //Now initialize websocket communication with server. Specify username in URL
        socket = new WebSocket(`wss://${window.location.host}?name=${currentUser}`);
        
        //Notify server that you want to look for a game.
        socket.onopen = () => {
          socket.send(JSON.stringify({subject: "logging in", username: currentUser}));
        }
        
        //Switch to game board once a game has been found.
        socket.onmessage = event => {
          console.log(currentUser+" Has incoming message from server: " +event.data);
          var json = JSON.parse(event.data)
          if(json.subject === "game found")  {
            console.log("game has been found, switching to game board..."); 
            window.location.href = `/gameBoard?name=${currentUser}`;
          }
        }
      }
    });
  });
}
