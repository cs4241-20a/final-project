// window.onload = function() {
//   document.getElementById('.sidenav').sidenav();
//   document.getElementById('#sidenav-left').sidenav({ edge: 'left' });
// }

//var goTask = document.getElementById('TaskDirect')
//goTask.onclick = function(e) {
//  console.log("Clicked")
//  e.preventDefault()
//  window.location = "/tasks"
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
//}

var logout = document.getElementById('logout-button')
logout.onclick = function(e) {
  e.preventDefault()
  window.location.href = "/logout"
}

const welcome = async () => {
  const res = await fetch("/api/users/", {method: "GET"})
  const data = await res.json()
  var topDiv = document.getElementById('top-div')
  var a = document.createElement('a')
  a.setAttribute('class', 'brand-logo')
  a.setAttribute('style', 'font-weight: 300;')
  var html = "Hello, " + data.data.displayName
  a.innerHTML = html
  topDiv.appendChild(a)

}

const addAllTasks = async () => {
  const res = await fetch("/api/groups", {method: "GET"})
  const data = await res.json()
  for(var i = 0; i < data.data.length; i++){
    addGroupTasks(data.data[i]._id)
  }
}

async function addGroupTasks(groupId) {
  const res1 = await fetch("/api/tasks/" + groupId, {method: "GET"})
  const data1 = await res1.json()
  var taskList = document.getElementById('task-list')
  for (var i = 0; i < data1.data.length; i++){
    var a = document.createElement("a")
    a.setAttribute('class', 'collection-item')
    a.setAttribute('id', data1.data[i]._id)
    a.setAttribute('href', '/tasks')
    a.innerHTML = data1.data[i].name
    taskList.appendChild(a)
  }
}

const addAllGroups = async () => {
  const res = await fetch("/api/groups", {method: "GET"})
  const data = await res.json()
  console.log(data)
  var fullRows = Math.floor(data.data.length/3)
  var mod = data.data.length%3
  for(var i = 0; i < fullRows; i++){
    const groupContainer = document.getElementById('group-container')
    var row = document.createElement("div")
    row.setAttribute('class', 'row')
    for(var j = 0; j < 3; j++){
      var div1 = document.createElement('div')
      div1.setAttribute('class', 'col s12 m4')
      var div2 = document.createElement('div')
      div2.setAttribute('class', 'card')
      var div3 = document.createElement('div')
      div3.setAttribute('class', 'card-content')
      var span = document.createElement('span')
      span.setAttribute('class', 'card-title')
      var a = document.createElement('a')
      a.setAttribute('class', 'teal-text')
      a.setAttribute('href', '/tasks')
      a.setAttribute('style', 'font-weight: 400;')
      a.setAttribute('id', data.data[i*3+j]._id)
      a.innerHTML = data.data[i*3+j].name
      span.appendChild(a)
      div3.appendChild(span)
      div2.appendChild(div3)
      div1.appendChild(div2)
      row.appendChild(div1)
    }
  groupContainer.append(row)
  }
  for(var i = 0; i < 1; i++) {
    const groupContainer = document.getElementById('group-container')
    var row = document.createElement("div")
    row.setAttribute('class', 'row')
    for (var j = 0; j < mod; j++) {
      var div1 = document.createElement('div')
      div1.setAttribute('class', 'col s12 m4')
      var div2 = document.createElement('div')
      div2.setAttribute('class', 'card')
      var div3 = document.createElement('div')
      div3.setAttribute('class', 'card-content')
      var span = document.createElement('span')
      span.setAttribute('class', 'card-title')
      var a = document.createElement('a')
      a.setAttribute('class', 'teal-text')
      a.setAttribute('href', '/tasks')
      a.setAttribute('style', 'font-weight: 400;')
      a.setAttribute('id', data.data[fullRows * 3 + j]._id)
      a.innerHTML = data.data[fullRows * 3 + j].name
      span.appendChild(a)
      div3.appendChild(span)
      div2.appendChild(div3)
      div1.appendChild(div2)
      row.appendChild(div1)
    }
    groupContainer.append(row)
  }
}

var createGroup = async function(e){
  e.preventDefault()
  var g = document.getElementById('group-name')
  var name = g.value
  console.log(name)
  const res = await fetch("/api/groups", {method: "POST", body: JSON.stringify({name}), headers: {"Content-type": "application/json"}})
  const data = await res.json()
  window.location.href="/"

}

const  addAllInvites = async () => {
  const res = await fetch("/api/groups/invites/", {method: "GET"})
  const data = await res.json()
  var inviteDiv = document.getElementById('invite-div')
  for(var i = 0; i < data.data.length; i++){
    var div1 = document.createElement('div')
    div1.setAttribute('class', 'collection-item avatar')
    div1.setAttribute('id', data.data[i]._id)
    var i = document.createElement('i')
    i.setAttribute('class', 'large material-icons circle red')
    var span = document.createElement('span')
    span.setAttribute('class', 'title teal-text text-darken-3')
    span.innerHTML = data.data[i].name
    var div2 = document.createElement('div')
    div2.setAttribute('class', 'row')
    var a1 = document.createElement('a')
    a1.setAttribute('class', 'waves-effect waves-light btn-small blue')
    a1.setAttribute('id', 'accept-' + data.data[i]._id)
    document.getElementById('accept-' + data.data[i]._id).addEventListener('click', acceptInvite(data.data[i]))
    a1.innerHTML = "Accept"
    var a2 = document.createElement('a')
    a2.setAttribute('class', 'waves-effect waves-light btn-small red')
    a2.setAttribute('id', 'reject-' + data.data[i]._id)
    document.getElementById('reject-' + data.data[i]._id).addEventListener('click', rejectInvite(data.data[i]))
    a2.innerHTML = "Reject"
    div2.appendChild(a1)
    div2.appendChild(a2)
    div1.appendChild(i)
    div1.appendChild(span)
    div1.appendChild(div2)
    inviteDiv.append(div1)
  }
}

var acceptInvite = async function(group) {
  const res = await fetch("/api/users/", {method: "GET"})
  const data = await res.json()
  var userId = data.data._id
  var invitees = group.invitees
  invitees = invitees.filter(invitee => invitee._id != userId)
  var members = group.members
  members = members.push(userId)
  const res1 = await fetch("/api/groups/" + group._id, {method: "PATCH", body: JSON.stringify({members, invitees}), headers: {"Content-type": "application/json"}})
  window.location.href="/"
}

var declineInvite = async function(group) {
  const res = await fetch("/api/users/", {method: "GET"})
  const data = await res.json()
  var userId = data.data._id
  var invitees = group.invitees
  invitees = invitees.filter(invitee => invitee._id != userId)
  const res1 = await fetch("/api/groups/" + group._id, {method: "PATCH", body: JSON.stringify({invitees}), headers: {"Content-type": "application/json"}})
  window.location.href="/"
}




window.onload = function() {
  addAllTasks()
  addAllGroups()
  welcome()
  addAllInvites()

  const groupButton = document.getElementById("create-group")
  groupButton.onclick = createGroup

  const acceptButton = document.querySelector('.accept-btn')
  acceptButton.onclick = acceptInvite

}