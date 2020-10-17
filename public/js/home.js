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

console.log(document.getElementById('logout-button'))
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



window.onload = function() {
  addAllTasks()
  addAllGroups()
  welcome()
  const groupButton = document.getElementById("create-group")
  groupButton.onclick = createGroup
}
