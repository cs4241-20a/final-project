///////////////SCHEDULING CODE////////////////
const callToScheduling = function() {  
  if (document.getElementById("inputSID").value == "") {
    alert("Please enter a Schedule ID before continuing");
    return false;
  }

  let schedID = document.getElementById("inputSID").value,
      inputs = document.getElementById("input-sid"),
      content = document.getElementById("content"),
      comments = document.getElementById("comments");
  
  inputs.style.display = "none";
  content.style.display = "flex";
  comments.style.display = "block";

  //{scheduleID:''}
  const scheduleID = document.querySelector("#inputSID"),
    json = {
      scheduleID: scheduleID.value
    },
    body = JSON.stringify(json);

  let scheds = [];
  fetch("/getSched", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(json => {
      scheds = json;
      for (let i = 0; i < scheds.length; i++){
        document.getElementById("comments").innerHTML += scheds[i].name + ': ' + scheds[i].comments + '</br>';       
      }

      //erasing fields in case you click the button more than once
      clearSFields();
    
      var availabilities = [];
      for (var i = 0; i < scheds.length; i++) {
        availabilities.push([scheds[i].name, scheds[i].statusData]);
      }
    
    fetch("/getMeeting", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(json => {
      var days = json.days;
      var startTime = parseInt(json.start);
      var endTime = parseInt(json.end);
      
      var colorArray = defineColors(availabilities.length);

      var avails = restructureAvails(availabilities);

      sTable(days, startTime, endTime, avails, colorArray); //days here means days of the week

      addListener(avails);
    });
    });
};

//functions for the color scale
function calcPartitions(numColors) {
  if (numColors <= 1) {
    return [50];
  } else {
    var p = 100 / (numColors - 1);
    var splits = [];
    for (var i = 0; i < numColors; i++) {
      splits.push(p * i);
    }
    return splits;
  }
}

function weightColors(p, color1, color2) {
  var p2 = 100 - p;
  var r = Math.round((color1[0] * p + color2[0] * p2) / 100).toString(16);
  var g = Math.round((color1[1] * p + color2[1] * p2) / 100).toString(16);
  var b = Math.round((color1[2] * p + color2[2] * p2) / 100).toString(16);
  if (r.length < 2) {
    r = "0" + r;
  }
  if (g.length < 2) {
    g = "0" + g;
  }
  if (b.length < 2) {
    b = "0" + b;
  }
  return "#" + r + g + b;
}

function makeBar(colArray) {
  var bar = document.getElementById("colorbar");
  let barHeader = bar.createTHead(),
    allAvailRow = barHeader.insertRow(),
    allAvailTxt = allAvailRow.insertCell();

  allAvailTxt.innerHTML = "All Available";

  for (let i = colArray.length - 1; i >= 0; i--) {
    var newColor = bar.insertRow();
    var colorBox = newColor.insertCell();
    colorBox.style.height = "3vh";
    colorBox.style.backgroundColor = colArray[i];
  }

  var noneAvailRow = bar.insertRow();
  var noneAvailTxt = noneAvailRow.insertCell();
  noneAvailTxt.innerHTML = "None Available";
}

function calcColors(numPeople, color1, color2) {
  var numColors = numPeople * 2 + 1;
  var splits = calcPartitions(numColors);
  var colors = [];
  for (var k = 0; k < numColors; k++) {
    colors.push(weightColors(splits[k], color1, color2));
  }
  return colors;
}

function getColor(val, colArray) {
  return colArray[val * 2];
}

const defineColors = function(alength) {
  var color1 = [55, 63, 255]; //all available
  var color2 = [247, 236, 202]; //none available
  var colorArray = calcColors(alength, color1, color2);
  makeBar(colorArray);
  return colorArray;
};

//clears elements
const clearSFields = function() {
  document.getElementById("availTable").innerHTML = "";
  document.getElementById("colorbar").innerHTML = "";
  document.getElementById("listAvailPeople").innerHTML = "";
  document.getElementById("listFlexPeople").innerHTML = "";
  document.getElementById("listBusyPeople").innerHTML = "";
}

//listener for clicking on time blocks
const addListener = function(avails) {
  document.addEventListener("click", function(event) {
    if (event.target.matches(".sCell")) {
      var cellIndices = parseScheduleID(event.target.id);
      displayPeople(cellIndices[0], cellIndices[1], avails);
    }
  });
};

//support functions for event listeners
function parseScheduleID(cid) {
  cid = cid.slice(1);
  cid = cid.split("-");
  return cid;
}

const displayPeople = function(rowIndex, colIndex, avails) {
  var block = avails[rowIndex][colIndex];
  document.getElementById("listAvailPeople").innerHTML = listPrint(block[1]);
  document.getElementById("listFlexPeople").innerHTML = listPrint(block[2]);
  document.getElementById("listBusyPeople").innerHTML = listPrint(block[3]);
};

function listPrint(l) {
  var s = "";
  if (l.length > 1) {
    for (var i = 0; i < l.length - 1; i++) {
      s += l[i] + "<br>";
    }
  } else if (l.length == 0) {
    return s;
  }
  s += l[l.length - 1];
  return s;
}

//constructs the table
const sTable = function(days, startTime, endTime, avails, colorArray) {
  var table = document.getElementById("availTable");

  let dayRow = table.insertRow(0),
    timeCol = dayRow.insertCell(0),
    cellNum = 1;

  for (let i = 0; i < days.length; i++) {
    let newDay = dayRow.insertCell();
    cellNum++;

    if (days[i] == "0") {
      newDay.innerHTML = "Monday";
    } else if (days[i] == "1") {
      newDay.innerHTML = "Tuesday";
    } else if (days[i] == "2") {
      newDay.innerHTML = "Wednesday";
    } else if (days[i] == "3") {
      newDay.innerHTML = "Thursday";
    } else if (days[i] == "4") {
      newDay.innerHTML = "Friday";
    } else if (days[i] == "5") {
      newDay.innerHTML = "Saturday";
    } else if (days[i] == "6") {
      newDay.innerHTML = "Sunday";
    }
  }
  
  for (let t = startTime; t <= endTime; t++) {
    let newTimeRow = table.insertRow(-1),
      time = newTimeRow.insertCell(0);
    
    for (let d = 1; d < cellNum; d++) {
      let cell = newTimeRow.insertCell();

      cell.style.cursor = "pointer";
      var rowIndex = t - startTime;
      var colIndex = d - 1;
      var statVal = avails[rowIndex][colIndex][0];
      cell.style.backgroundColor = getColor(statVal, colorArray);
      cell.id = "c" + rowIndex + "-" + colIndex;
      cell.classList.add("sCell");

      if (t == 0) {
        time.innerHTML = "12 AM";
      } else if (t > 0 && t < 12) {
        time.innerHTML = t + " AM";
      } else if (t == 12) {
        time.innerHTML = "12 PM";
      } else if (t > 12 && t < 24) {
        time.innerHTML = t - 12 + " PM";
      }
    }
  }
};

//support function that helps make information readable for the other functions
const restructureAvails = function(avail) {
  //create array of [day[time[[availPeople],[tentPeople],[busyPeople]]]]
  var r = [];
  //initialize
  var days = avail[0][1];
  for (var i = 0; i < days.length; i++) {
    var day = [];
    var blocks = days[i];
    for (var k = 0; k < blocks.length; k++) {
      day.push([0, [], [], []]); //statusvalue, availablePeople, tentativePeople, busyPeople
    }
    r.push(day);
  }
  for (var j = 0; j < avail.length; j++) {
    var person = avail[j];
    for (var d = 0; d < person[1].length; d++) {
      for (var b = 0; b < person[1][d].length; b++) {
        var val = person[1][d][b];
        r[d][b][0] += val;
        if (val == 1) {
          r[d][b][1].push(person[0]);
        } else if (val == 0.5) {
          r[d][b][2].push(person[0]);
        } else if (val == 0) {
          r[d][b][3].push(person[0]);
        }
      }
    }
  }
  return r;
};
