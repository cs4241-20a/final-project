var goTask = document.getElementById('TaskDirect')
goTask.onclick = function(e) {
  e.preventDefault()
  fetch('/tasks', {
    method: 'GET',
    headers: {
      "Content-type": "application/json"
    }
  })
  .then(function(response) {
      return response.json();
  })
}
