var goTask = document.getElementById('TaskDirect')
goTask.onclick = function(e) {
  e.preventDefault()
  window.location.href = "/auth/github/login";
}
