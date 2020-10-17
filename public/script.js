// Add some Javascript code here, to run on the front end.

// TOP MENU BUTTONS --------------
const goToChat = function(e) {
  e.preventDefault();

  fetch("/goToChat", {
    method: "GET"
  }).then(url => {
    window.location.href = "/chat";
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

const goToUsers = function(e) {
  e.preventDefault();

  fetch("/goToUsers", {
    method: "GET"
  }).then(url => {
    window.location.href = "/users";
  });

  return false;
};

const logout = function(e) {
  e.preventDefault();

  fetch("/logout", {
    method: "GET"
  }).then(url => {
    window.location.href = "/";
  });

  return false;
};

// -------------------------------

var entryArray = [];

// Allow clearing of input values
const clear = function(e) {
  e.preventDefault();

  const date = document.querySelector("#date"),
    musclegroup = document.querySelector("#muscleGroup"),
    exercise = document.querySelector("#exercise"),
    repcount = document.querySelector("#reps"),
    weight = document.querySelector("#weight");

  date.value = "";
  exercise.value = "";
  musclegroup.value = "";
  repcount.value = "";
  weight.value = "";

  // reset buttons
  const button = document.querySelector("#addButton");
  button.innerHTML = "Submit";
  button.onclick = submit;

  const clearButton = document.querySelector("#clearButton");
  clearButton.innerHTML = "Clear";
  clearButton.onclick = clear;
};

const retrieveInput = function() {
  console.log("Some version of submit hit");
  // create json listing of input params
  const date = document.querySelector("#date"),
    musclegroup = document.querySelector("#muscleGroup"),
    exercise = document.querySelector("#exercise"),
    repcount = document.querySelector("#reps"),
    weight = document.querySelector("#weight"),
    json = {
      date: date.value,

      musclegroup: musclegroup.value,
      exercise: exercise.value,
      repcount: repcount.value,
      weight: weight.value
    };

  // check for empty values
  for (const [key, value] of Object.entries(json)) {
    if (typeof value === "string" && value === "") {
      console.warn("Must specify value for " + key + "!");
      return false;
    }
  }

  // verify distance and loft are numbers
  if (isNaN(repcount.value)) {
    console.warn("Reps must be a number!");
    return false;
  }
  if (isNaN(weight.value)) {
    console.warn("Weight must be a number!");
    return false;
  }

  return JSON.stringify(json);
};

const submit = function(e) {
  // prevent default form action from being carried out
  e.preventDefault();

  // retrieve input
  const json = retrieveInput();

  // verify json is valid
  if (!json) {
    // don't clear invalid requests
    return false;
  }

  // add to server
  fetch("/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json
  })
    .then(function(response) {
      return response.json(); // wait on response
    })
    .then(json => {
      // update local array as well (avoid tons of DB I/O)
      entryArray.push(json);
      displayEntries(); // update table
    });

  // clear inputs now that we have retrieved them
  clear(e);
  return false;
};

const submitEdits = function(dataID) {
  // retrieve input
  const json = retrieveInput();

  // verify json is valid
  if (!json) {
    return;
  }

  var object = JSON.parse(json);
  object._id = dataID;
  const body = JSON.stringify(object);

  console.log("trying to post edit");
  // add to server
  fetch("/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body
  }).then(() => {
    console.log("posted edit");
    // update fields
    for (var i = 0; i < entryArray.length; i++) {
      if (entryArray[i]._id === dataID) {
        entryArray[i] = object;
        console.log(entryArray);
      }
    }
    displayEntries(); // update table
  });

  return false;
};

const edit = function(dataID) {
  // set appropriate fields from element
  var element = entryArray.filter(function(value, index, arr) {
    return value._id === dataID;
  });

  element = element[0];

  const date = document.querySelector("#date"),
    musclegroup = document.querySelector("#muscleGroup"),
    exercise = document.querySelector("#exercise"),
    repcount = document.querySelector("#reps"),
    weight = document.querySelector("#weight");

  date.value = element.date;
  musclegroup.value = element.musclegroup;
  exercise.value = element.exercise;
  repcount.value = element.repcount;
  weight.value = element.weight;

  // change submit button to become "update field"
  const button = document.querySelector("#addButton");
  button.innerHTML = "Update";
  button.onclick = function(e) {
    e.preventDefault(); //prevent reload
    submitEdits(dataID); //submit edits
    clear(e); //clear the inputs and reset buttons
  };

  const clearButton = document.querySelector("#clearButton");
  clearButton.innerHTML = "Cancel";

  return false;
};

const deleteFunc = function(dataID) {
  // remove entry from database
  fetch("/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _id: dataID })
  });

  entryArray = entryArray.filter(function(value, index, arr) {
    return value._id != dataID;
  });

  // now that item is deleted, it can't be edited
  // handle weird edge case of deleting item while editing it
  const clearButton = document.querySelector("#clearButton");
  if (clearButton.innerHTML === "Cancel") {
    clearButton.click();
  }

  displayEntries(); // update table

  return false;
};

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
    var editButtonCell = row.insertCell(5);
    var deleteButtonCell = row.insertCell(6);

    // update text displayed in each cell
    date.innerHTML = input.date;
    muscleGroup.innerHTML = input.musclegroup;
    exercise.innerHTML = input.exercise;
    repCount.innerHTML = input.repcount;
    weight.innerHTML = input.weight;

    // add edit and delete buttons to each row with a stored reference to row
    var editButton = document.createElement("button");
    editButton.style =
      "font-family: 'Staatliches', cursive; color:#9DFF12; background-color: black; font-size: 25px; border: 3px solid black;border-radius: 10px; width: 100px;";
    editButton.innerHTML = "Edit";
    editButton.onclick = function() {
      edit(input._id);
    };
    editButtonCell.appendChild(editButton);

    var deleteButton = document.createElement("button");
    deleteButton.style =
      "font-family: 'Staatliches', cursive; color:#9DFF12; background-color: black; font-size: 25px; border: 3px solid black;border-radius: 10px; width: 100px;";

    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = function() {
      deleteFunc(input._id);
    };
    deleteButtonCell.appendChild(deleteButton);
  }
};

window.onload = function() {
  const button = document.querySelector("#addButton");
  button.onclick = submit;

  const chatButton = document.querySelector("#chatButton");
  chatButton.onclick = goToChat;

  const friendsButton = document.querySelector("#friendsButton");
  friendsButton.onclick = goToUsers;
  
  const aboutButton = document.querySelector("#aboutButton");
  aboutButton.onclick = goToAbout;

  const logoutButton = document.querySelector("#logoutButton");
  logoutButton.onclick = logout;

  const clearButton = document.querySelector("#clearButton");
  clearButton.onclick = clear;
  
  /*
    Load from DB into memory
    */
  fetch("/data")
    .then(function(response) {
      return response.json(); // wait on response
    })
    .then(function(array) {
      // parse from array into table
      entryArray = array;
      displayEntries();
    });
};
