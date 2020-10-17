const get = function() {
  const available = document.getElementById("available"),
    tentative = document.getElementById("tentative"),
    busy = document.getElementById("busy");
  let status = "";

  if (available.checked) {
    status = "available";
    return status;
  } else if (tentative.clicked) {
    status = "tentative";
    return status;
  } else {
    status = "busy";
    return status;
  }
};

// get html elements and set status var
const table = document.getElementById("calendar"),
  available = document.getElementById("available"),
  tentative = document.getElementById("tentative"),
  busy = document.getElementById("busy");
let status = "available";

const loadCalendar = function(schedule) {
  let status = "available";

  let days = schedule.days,
    startTime = schedule.start,
    endTime = schedule.end;

  makeTable(days, startTime, endTime);
};

available.addEventListener("click", function() {
  status = "available";
});

tentative.addEventListener("click", function() {
  status = "tentative";
});

busy.addEventListener("click", function() {
  status = "busy";
});

const makeTable = function(days, start, end) {
  let dayHeader = table.createTHead(),
    dayRow = dayHeader.insertRow(0),
    timeCol = dayRow.insertCell(0),
    cellNum = 1;

  for (let i = 0; i < days.length; i++) {
    let newDay = dayRow.insertCell(cellNum);
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

  let newTime = start,
    period = end - start;

  for (let t = 0; t <= period; t++) {
    let newTimeRow = table.insertRow(-1),
      time = newTimeRow.insertCell(0);

    for (let d = 1; d < cellNum; d++) {
      let cell = newTimeRow.insertCell(d);
      cell.style.backgroundColor = "#64CE8D";

      cell.style.cursor = "pointer";

      cell.addEventListener("click", function() {
        console.log(status);

        if (status == "available") {
          cell.style.backgroundColor = "#64CE8D";
          cell.classList.add("a");
          cell.classList.remove("t");
          cell.classList.remove("b");
        } else if (status == "tentative") {
          cell.style.backgroundColor = "#EEDA95";
          cell.classList.add("t");
          cell.classList.remove("a");
          cell.classList.remove("b")
        } else if (status == "busy") {
          cell.style.backgroundColor = "#FFA69E";
          cell.classList.add("b");
          cell.classList.remove("a");
          cell.classList.remove("t");
        }
      });
    }

    if (newTime == 0) {
      newTime.innerHTML = "12 AM";
    } else if (newTime > 0 && newTime < 12) {
      time.innerHTML = newTime + " AM";
    } else if (newTime == 12) {
      time.innerHTML = "12 PM";
    } else if (newTime > 12 && newTime < 24) {
      time.innerHTML = newTime - 12 + " PM";
    }

    newTime++;
  }
};

function idButton() {
  let schedID = document.getElementById("inputID").value,
    creds = document.getElementById("creds"),
    content = document.getElementById("content"),
    y = document.getElementById("name").value,
    z = document.getElementById("email").value,
    submit = document.getElementById("submit-availability");

  if (schedID == "") {
    alert("Please enter a Schedule ID before continuing");
    return false;
  }
  if (y == "") {
    alert("Please enter a name before continuing");
    return false;
  }
  if (z == "") {
    alert("Please enter a email before continuing");
    return false;
  }

  creds.style.display = "none";
  content.style.display = "flex";
  submit.style.display = "block";

  //{name: “”, email: “”, days: “”, start:””, end: “”}
  const id = document.querySelector("#inputID"),
    json = {
      scheduleID: id.value
    },
    body = JSON.stringify(json);

  fetch("/getMeeting", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(json => {
      console.log(json);
      loadCalendar(json);
    });
}

const collectAvailabilityData = function() {
  ////gets info off the table
  var cal = document.getElementById("calendar");
  var statusData = [];
  //skip col and row headers
  for (var i = 1, row; (row = cal.rows[i]); i++) {
    var rowStatus = [];
    for (var j = 1, col; (col = row.cells[j]); j++) {
      //console.log(row.cells[j])
      rowStatus.push(statusToValue(row.cells[j], i, j));
    }
    statusData.push(rowStatus);
  }
  return statusData;
};

function statusToValue(status, i, j) {
    if (status.style.backgroundColor == "rgb(100, 206, 141)") {
     // console.log("getting available value ");
      return 1;
    } else if (status.style.backgroundColor == "rgb(238, 218, 149)") {
     // console.log("getting tentative value ");
      return 0.5;

    } else if (status.style.backgroundColor == "rgb(255, 166, 158)") {
     // console.log("getting busy value ");
      return 0;
    } else {
     // console.log("getting default value ");
      return 0; //assuming default/unset as busy

    }
}

//import { stringify } from 'query-string';

function availabilityButton(meetingObj) {
  const abutton = document.getElementById("submit-availability");
  abutton.addEventListener("click", e => {
    e.preventDefault();
  });
  let schedID = document.getElementById("inputID").value,
    y = document.getElementById("name").value,
    z = document.getElementById("email").value



  if (schedID == "") {
    alert("Please enter a Schedule ID before continuing");
    return false;
  }
  if (y == "") {
    alert("Please enter a name before continuing");
    return false;
  }
  if (z == "") {
    alert("Please enter a email before continuing");
    return false;
  }

  //{scheduleID:'', name: “”, email: “”, days: daysArrayData, comments: “”}
  const scheduleID = document.querySelector("#inputID"),
    name = document.querySelector("#name"),
    email = document.querySelector("#email"),
    chatSend = document.querySelector("#chat"),
    daysArray = collectAvailabilityData(),
    json = {
      scheduleID: scheduleID.value,
      name: name.value,
      email: email.value,
      statusData: daysArray,
      comments: chatSend.value
    },
    body = JSON.stringify(json);

  fetch("/add", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(json => {
      //we submit the info the the server now we should go to the scheduling page and request all users avail with a meeting code
      window.location.href = "scheduling.html"; //turning off temporarily to see console output
  });
}
