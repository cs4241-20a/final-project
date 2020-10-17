const callToMaker = function() {
  ////////code in meetingMaker
  var schedID = "";

  let mon = document.querySelector("#weekday-mon"),
    tue = document.querySelector("#weekday-tue"),
    wed = document.querySelector("#weekday-wed"),
    thu = document.querySelector("#weekday-thu"),
    fri = document.querySelector("#weekday-fri"),
    sat = document.querySelector("#weekday-sat"),
    sun = document.querySelector("#weekday-sun");

  let daysOfWeek = [];

  if (document.querySelector("#weekday-sun").checked) {
    daysOfWeek.push("0");
  }
  if (document.querySelector("#weekday-mon").checked) {
    daysOfWeek.push("1");
  }
  if (document.querySelector("#weekday-tue").checked) {
    daysOfWeek.push("2");
  }
  if (document.querySelector("#weekday-wed").checked) {
    daysOfWeek.push("3");
  }
  if (document.querySelector("#weekday-thu").checked) {
    daysOfWeek.push("4");
  }
  if (document.querySelector("#weekday-fri").checked) {
    daysOfWeek.push("5");
  }
  if (document.querySelector("#weekday-sat").checked) {
    daysOfWeek.push("6");
  }

  ////times of day

  var startTime = document.getElementById("startTime");
  var start = startTime.value;

  var endTime = document.getElementById("endTime");
  var end = endTime.value;

  //console.log("days array " + daysOfWeek);
  var meetingObj = "";

  var x = daysOfWeek;

  //make sure text input isn't empty
  if (x.length == 0) {
    alert("Please select days of the week");
    return false;
  }
  if (start == null) {
    alert("Please select a start time");
    return false;
  }
  if (end == null) {
    alert("Please select a end time");
    return false;
  }
  if (end - start <= 0) {
    alert("Please select a valid time period");
    return false;
  }

  //{name: “”, email: “”, days: “”, start:””, end: “”}
  const 
    json = {
      days: x,
      start: start,
      end: end
    },
    body = JSON.stringify(json);

  fetch("/addMeeting", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(json => {
      var displayID = json.scheduleID;
      
      var str="Your Meeting ID is " +displayID + " .Please copy and paste it before continuing!!";
      
      alert(str)
    
    window.location.href = "availability.html";
    });
};

function addUser(userObj) {
  const scheduleID = userObj.scheduleID,
    sendObj = {
      scheduleID: scheduleID
    },
    bodyNew = JSON.stringify(sendObj);

  console.log("body new" + bodyNew);

  fetch("/add", {
    method: "POST",
    bodyNew,
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(json => {
      console.log("user info" + json);
    });
}
