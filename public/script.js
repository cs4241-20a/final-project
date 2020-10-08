// Add some Javascript code here, to run on the front end.

var golfBagArray = [];

// Allow clearing of input values
const clear = function(e) {
  e.preventDefault();

  const manufacturer = document.querySelector("#clubManufacturer"),
    model = document.querySelector("#clubModel"),
    type = document.querySelector("#clubType"),
    loft = document.querySelector("#clubLoft"),
    distance = document.querySelector("#clubDistance");

  manufacturer.value = "";
  model.value = "";
  type.value = "";
  loft.value = "";
  distance.value = "";

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
  const manufacturer = document.querySelector("#clubManufacturer"),
    model = document.querySelector("#clubModel"),
    type = document.querySelector("#clubType"),
    loft = document.querySelector("#clubLoft"),
    distance = document.querySelector("#clubDistance"),
    json = {
      manufacturer: manufacturer.value,
      model: model.value,
      type: type.value,
      loft: Number(loft.value).toFixed(1),
      distance: Number(distance.value).toFixed(1),
      ballSpeed: (distance.value / 1.75).toFixed(1),
      swingSpeed: (distance.value / 1.75 / 1.5).toFixed(1)
    };
  
  // check for empty values
  for (const [key, value] of Object.entries(json)) {
    if (typeof value === 'string' && value === "") {
      console.warn("Must specify value for " + key + "!");
      return false;
    }
  }


  // verify distance and loft are numbers
  if (isNaN(loft.value)) {
    console.warn("Loft must be a number!");
    return false;
  }
  if (isNaN(distance.value)) {
    console.warn("Distance must be a number!");
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
      golfBagArray.push(json);
      displayGolfBag(); // update golf bag table
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
  const body = JSON.stringify(object)

  console.log("trying to post edit")
  // add to server
  fetch("/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body
  }).then(() => {
    console.log("posted edit")
    // update fields
    for (var i = 0; i < golfBagArray.length; i++) {
      if (golfBagArray[i]._id === dataID) {
        golfBagArray[i] = object;
        console.log(golfBagArray)
      }
    }
    displayGolfBag(); // update golf bag table
  });

  return false;
};

const edit = function(dataID) {  
  // set appropriate fields from element
  var element = golfBagArray.filter(function(value, index, arr) {
    return (value._id === dataID);
  });

  element = element[0];

  const manufacturer = document.querySelector("#clubManufacturer"),
    model = document.querySelector("#clubModel"),
    type = document.querySelector("#clubType"),
    loft = document.querySelector("#clubLoft"),
    distance = document.querySelector("#clubDistance");

  manufacturer.value = element.manufacturer;
  model.value = element.model;
  type.value = element.type;
  loft.value = element.loft;
  distance.value = element.distance;

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

  golfBagArray = golfBagArray.filter(function(value, index, arr) {
    return value._id != dataID;
  });
  
  // now that item is deleted, it can't be edited
  // handle weird edge case of deleting item while editing it
  const clearButton = document.querySelector("#clearButton");
  if (clearButton.innerHTML === "Cancel") {
    clearButton.click();
  }

  displayGolfBag(); // update golf bag table

  return false;
};

// update table using provided array of json elements to be displayed in the table
// replaces existing table
const displayGolfBag = function() {
  // retrieve existing golf bag table
  const golfBag = document.querySelector("#clubs");

  // update golfBagArray to verify it is sorted
  golfBagArray.sort(function(a, b) {
    if (a.distance < b.distance) {
      return 1;
    }
    if (a.distance > b.distance) {
      return -1;
    }
    return 0;
  });

  // replace existing table with new table
  document.getElementById("clubs").innerHTML = "";
  for (var i = 0; i < golfBagArray.length; i++) {
    // grab current json element and create a new row in the table since the
    // data is already sorted server side
    const input = golfBagArray[i];
    var row = golfBag.insertRow(-1);

    // create cells corresponding to th headers
    var manufacturer = row.insertCell(0);
    var model = row.insertCell(1);
    var type = row.insertCell(2);
    var loft = row.insertCell(3);
    var distance = row.insertCell(4);
    var ballSpeed = row.insertCell(5);
    var swingSpeed = row.insertCell(6);
    var editButtonCell = row.insertCell(7);
    var deleteButtonCell = row.insertCell(8);

    // update text displayed in each cell
    manufacturer.innerHTML = input.manufacturer;
    model.innerHTML = input.model;
    type.innerHTML = input.type;
    loft.innerHTML = input.loft;
    distance.innerHTML = input.distance;
    ballSpeed.innerHTML = input.ballSpeed;
    swingSpeed.innerHTML = input.swingSpeed;

    // add edit and delete buttons to each row with a stored reference to row
    var editButton = document.createElement("button");
    editButton.style = " color:blue;"
    editButton.innerHTML = "Edit";
    editButton.onclick = function() {
      edit(input._id);
    };
    editButtonCell.appendChild(editButton);

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = function() {
      deleteFunc(input._id);
    };
    deleteButtonCell.appendChild(deleteButton);
  }
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

window.onload = function() {
  const button = document.querySelector("#addButton");
  button.onclick = submit;

  const logoutButton = document.querySelector("#logoutButton");
  logoutButton.onclick = logout;

  const clearButton = document.querySelector("#clearButton");
  clearButton.onclick = clear;

  /*
    Load golf bag from golfbag array in memory
    */
  fetch("/golfbag")
    .then(function(response) {
      return response.json(); // wait on response
    })
    .then(function(array) {
      // parse from array into table
      golfBagArray = array;
      displayGolfBag();
    });
};
