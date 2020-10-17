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
let groupName = "test";
export { groupName };
var groupID;

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
    a.onclick = function() {
      window.sessionStorage.setItem("group", groupId)
      console.log(window.sessionStorage.getItem("group"))
    }
    taskList.appendChild(a)
  }
}

const addAllGroups = async () => {
  const res = await fetch("/api/groups", {method: "GET"})
  const data = await res.json()
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
      console.log(data.data[i*3+j]._id)
      a.onclick = function() {
        window.sessionStorage.setItem("group", data.data[i*3+j]._id)
        console.log(window.sessionStorage.getItem("group"))
      }
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
      console.log(data.data[fullRows*3+j]._id)
      window.sessionStorage.setItem("group", data.data[fullRows*3+j]._id)
      console.log(window.sessionStorage.getItem("group"))
      groupID = new String(data.data[fullRows*3+j]._id) //JSON.parse(JSON.stringify({id: data.data[fullRows*3+j]._id})).id
      a.onclick = () => {
        console.log("TELL ME SOMETHING!")
        window.sessionStorage.setItem("group", groupID)
        console.log(window.sessionStorage.getItem("group"))
      }
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
  const res = await fetch("/api/groups/invites", {method: "GET"})
  const data = await res.json()
  var inviteDiv = document.getElementById('invite-div')
  for(var j = 0; j < data.data.length; j++){
    var div1 = document.createElement('div')
    div1.setAttribute('class', 'collection-item avatar')
    div1.setAttribute('id', data.data[j]._id)
    var i = document.createElement('i')
    i.setAttribute('class', 'large material-icons circle red')
    i.innerHTML = "account_circle"
    var span = document.createElement('span')
    span.setAttribute('class', 'title teal-text text-darken-3')
    var groupName = data.data[j].name
    span.innerHTML = groupName
    var div2 = document.createElement('div')
    div2.setAttribute('class', 'row')
    var a1 = document.createElement('a')
    a1.setAttribute('class', 'waves-effect waves-light btn-small blue')
    var group = {_id: data.data[j]._id, invitees: data.data[j].invitees, members: data.data[j].members}
    a1.addEventListener('click', (e) => {
      e.preventDefault()
      acceptInvite(group)
    })
    a1.innerHTML = "Accept"
    var a2 = document.createElement('a')
    a2.setAttribute('class', 'waves-effect waves-light btn-small red')
    a2.addEventListener('click', (e) => {
      e.preventDefault()
      rejectInvite(group)
    })
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
  for(var i = 0; i < invitees.length; i++){
    if(invitees[i] === userId){
      invitees.splice(i)
    }
  }
  var members = group.members
  members.push(userId)
  const res1 = await fetch("/api/groups/" + group._id, {method: "PATCH", body: JSON.stringify({members, invitees}), headers: {"Content-type": "application/json"}})
  window.location.href = "/"
}

var rejectInvite = async function(group) {
  const res = await fetch("/api/users/", {method: "GET"})
  const data = await res.json()
  var userId = data.data._id
  var invitees = group.invitees
  for(var i = 0; i < invitees.length; i++){
    if(invitees[i] === userId){
      invitees.splice(i)
    }
  }
  const res1 = await fetch("/api/groups/" + group._id, {method: "PATCH", body: JSON.stringify({invitees}), headers: {"Content-type": "application/json"}})
  window.location.href = "/"
}




window.onload = function() {
  addAllTasks()
  addAllGroups()
  welcome()
  addAllInvites()

  const groupButton = document.getElementById("create-group")
  groupButton.onclick = createGroup

}
