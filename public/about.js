// Add some Javascript code here, to run on the front end.

// TOP MENU BUTTONS --------------
const goHome = function(e) {
  e.preventDefault();
  
  fetch("/goHome", {
    method: "GET"
  }).then(url => {
    window.location.href = "/"
  })
  
  return false;
}

const goToChat = function(e) {
  e.preventDefault();
  
  fetch("/goToChat", {
    method: "GET"
  }).then(url => {
    window.location.href = "/chat"
  })
  
  return false;
}

const logout = function(e) {
  e.preventDefault();

  fetch("/logout", {
    method: "GET"
  }).then(url => {
    window.location.href = "/";
  });

  return false;
};

const goToUsers = function(e) {
  e.preventDefault();

  fetch("/goToUsers", {
    method: "GET"
  }).then(url => {
    window.location.href = "/users";
  });

  return false;
};


// -------------------------------

window.onload = function() {
  const homeButton = document.querySelector("#homeButton");
  homeButton.onclick = goHome;

  const logoutButton = document.querySelector("#logoutButton");
  logoutButton.onclick = logout;
  
  const chatButton = document.querySelector("#chatButton");
  chatButton.onclick = goToChat;
  
  const friendsButton = document.querySelector("#friendsButton");
  friendsButton.onclick = goToUsers;

};