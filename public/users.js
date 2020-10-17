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

const goToAbout = function(e) {
  e.preventDefault();

  fetch("/goToAbout", {
    method: "GET"
  }).then(url => {
    window.location.href = "/about";
  });

  return false;
};

// -------------------------------

var usersArray = [];
var entryArray = [];

const displayUsers = function() {
  // retrieve existing table
  const table = document.querySelector("#usersTable");

  // replace existing table with new table
  document.getElementById("usersTable").innerHTML = "";
  for (var i = 0; i < usersArray.length; i++) {
    // grab current json element and create a new row in the table since the
    // data is already sorted server side
    const input = usersArray[i];
    var row = table.insertRow(-1);

    // create cells corresponding to th headers
    var username = row.insertCell(0);
    var viewButtonCell = row.insertCell(1);

    // update text displayed in each cell
    username.innerHTML = input.username;
    
    var viewButton = document.createElement("button");
    viewButton.style =
      "font-family: 'Staatliches', cursive; color:#9DFF12; background-color: black; font-size: 25px; border: 3px solid black;border-radius: 10px; width: 100px;";
    viewButton.innerHTML = "View";
    viewButton.onclick = function() {
      displayUser(input.userID, input.username);
    };
    viewButtonCell.appendChild(viewButton);
  }
}

const displayUser = function(userID, username) {
  const json = {requestID: userID}
  
  fetch("/otherData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json)
  }).then(function(response) {
      return response.json(); // wait on response
    })
    .then(function(array) {
      // parse from array into table
      entryArray = array;
      // update name display
      document.getElementById("nameView").innerHTML = "You are viewing " + username + "'s workouts.";
      displayEntries();
    });
}

// update table using provided array of json elements to be displayed in the table
// replaces existing table
const displayEntries = function() {
  // retrieve existing table
  const table = document.querySelector("#entryTable");

  // replace existing table with new table
  document.getElementById("entryTable").innerHTML = "";
  for (var i = 0; i < entryArray.length; i++) {
    // grab current json element and create a new row in the table since the
    // data is already sorted server side
    const input = entryArray[i];
    var row = table.insertRow(-1);

    // create cells corresponding to th headers
    var date = row.insertCell(0);
    var muscleGroup = row.insertCell(1);
    var exercise = row.insertCell(2);
    var repCount = row.insertCell(3);
    var weight = row.insertCell(4);

    // update text displayed in each cell
    date.innerHTML = input.date;
    muscleGroup.innerHTML = input.musclegroup;
    exercise.innerHTML = input.exercise;
    repCount.innerHTML = input.repcount;
    weight.innerHTML = input.weight;
  }
};

window.onload = function() {
  const homeButton = document.querySelector("#homeButton");
  homeButton.onclick = goHome;

  const logoutButton = document.querySelector("#logoutButton");
  logoutButton.onclick = logout;
  
  const chatButton = document.querySelector("#chatButton");
  chatButton.onclick = goToChat;
  
  const aboutButton = document.querySelector("#aboutButton");
  aboutButton.onclick = goToAbout;
  
  fetch("/getUsers")
    .then(function(response) {
      return response.json(); // wait on response
    })
    .then(function(array) {
      // parse from array into table
      usersArray = array;
      displayUsers();
    });
  
};
