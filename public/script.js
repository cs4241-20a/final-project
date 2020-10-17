// client-side js, loaded by index.html
// run by the browser each time the page is loaded
const create = document.getElementById("createMeeting"),
  find = document.getElementById("loginMeeting"),
      view = document.getElementById("viewMeeting");

create.addEventListener("click", event => {
  window.location.href = "meetingMaker.html";
});

find.addEventListener("click", event => {
  window.location.href = "availability.html";
});

view.addEventListener("click", event => {
  window.location.href = "scheduling.html";
});

function callHome() {
  window.location.href = "index.html";
}
