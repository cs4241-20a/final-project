// Add some Javascript code here, to run on the front end.

// TOP MENU BUTTONS --------------
const back = function(e) {
  e.preventDefault();
  
  fetch("/", {
    method: "GET"
  }).then(url => {
    window.location.href = "/"
  })
  
  return false;
}

const login = function(e) {
  e.preventDefault();

  fetch("/login", {
    method: "GET"
  })
    .then(response => response.json())
    .then(url => {
      window.location.href = url;
    });

  return false;
};


// -------------------------------

window.onload = function() {
  const homeButton = document.querySelector("#backButton");
  homeButton.onclick = back;

  const logoutButton = document.querySelector("#loginButton");
  logoutButton.onclick = login;

};