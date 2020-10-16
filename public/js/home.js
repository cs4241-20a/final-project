// window.onload = function() {
//   document.getElementById('.sidenav').sidenav();
//   document.getElementById('#sidenav-left').sidenav({ edge: 'left' });
// }

var goTask = document.getElementById('TaskDirect')
goTask.onclick = function(e) {
  console.log("Clicked")
  e.preventDefault()
  window.location = "/tasks"
  // fetch('/tasks', {
  //   method: 'GET',
  //   headers: {
  //     "Content-type": "application/json"
  //   }
  // })
  // .then(function(response) {
  //     response.json()
  //     console.log(response.json())
  //     console.log("Moving to task page!")
  // })
}
