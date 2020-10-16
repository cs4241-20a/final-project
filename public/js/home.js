var goTask = document.getElementById('TaskDirect')
goTask.onclick = function(e) {
  console.log("Clicked")
  e.preventDefault()
  fetch('/tasks', {
    method: 'GET',
    headers: {
      "Content-type": "application/json"
    }
  })
  .then(response => response.json())
}
