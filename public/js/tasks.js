// Get the modal
var modal = document.getElementById("myModal");

var makeTask = function() {
  modal.style.display = "block";
}

var cancelTask = function(){
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (modal === event.target) {
    modal.style.display = "none";
  }
}

function getTasks() {
  var h = document.getElementById('group_name')
  var name = h.innerHTML
  fetch('/tasks', {
    method: 'GET',
    headers: {
      "Content-type": "application/json"
    }
  })
  .then(function(response) {
      return response.json();
  })
  .then(function(json) {
    console.log("Array: " + JSON.stringify(json))
    for(var i = 0; i < json.length; i++)
    {
      var task = json[i]
      console.log("append")
      appendNewInfo(task)
    }
  })
}

var addTask = function (e) {

  e.preventDefault()

  const input = document.querySelector( '#tname' )
  const input2 = document.querySelector( '#due_date' )
  const input3 = document.querySelector( '#tassignee')
  const input4 = document.querySelector( '#tags')
  const input5 = document.querySelector( '#tdesc')

  console.log(document.getElementById('group_name'))
  var h = document.getElementById('group_name')
  // Add in code for getting the group's name later
  var name = h.innerHTML
  const json = { group: name, task: input.value, duedate: input2.value, assignee: input3.value, tags: input4.value, description: input5.value }
  const body = JSON.stringify( json )
  console.log(body)

  fetch( '/add', {
         method:'POST',
         body,
         headers: {
          "Content-type": "application/json"
        }
    })
    .then( function( response ) {
      return response.json()
    })
    .then( function( json ) {
      console.log( json )
      var task = json
      appendNewInfo(task)
  })
  console.log(modal)
  modal.style.display = "none";
}

function appendNewInfo(task) {
  var div = document.createElement("div");
  var name = document.createElement("p");
  var due = document.createElement("p");
  var assigned = document.createElement("p");
  const col = document.getElementsByClassName('tasks')
  div.setAttribute('class', 'task_card card-panel col s1')
  name.setAttribute('class', 'task_item')
  due.setAttribute('class', 'task_item')
  assigned.setAttribute('class', 'task_item')
  name.appendChild(document.createTextNode(task.task))
  due.appendChild(document.createTextNode(task.duedate))
  assigned.appendChild(document.createTextNode(task.assignee))
  div.appendChild(name)
  div.appendChild(due)
  div.appendChild(assigned)
  col[0].appendChild(div)
}

var addCol = function() {
  const contain = document.getElementsByClassName("inner-container")
  console.log(contain)
  // Create all the necessary elements
  var newCol = document.createElement("div");
  newCol.setAttribute('class', 'task_lists card-panel materialize-red lighten-2')
  var newList = document.createElement("div")
  newList.setAttribute('class', 'tasks')
  var newlistName = document.createElement("h4")
  newlistName.setAttribute('class', 'white-text center-align row')
  var addBtn = document.createElement("a")
  addBtn.setAttribute('class', 'add_task centerwaves-effect waves-light btn-large')
  addBtn.setAttribute('type', 'centerwaves-effect waves-light btn-large')
  var plus = document.createElement("i")
  plus.setAttribute('class', 'material-icons right')
  // Add everything
  plus.appendChild(document.createTextNode("add"))
  addBtn.appendChild(plus)
  addBtn.appendChild(document.createTextNode(" New Task"))
  addBtn.onclick = makeTask
  newlistName.appendChild(document.createTextNode("New List"))
  newCol.appendChild(newlistName)
  newCol.appendChild(newList)
  newCol.appendChild(addBtn)
  contain[0].appendChild(newCol)
}

var delCol = function() {
  const contain = document.getElementsByClassName("inner-container")
  contain[0].removeChild(contain[0].lastChild)
  // Later on we'll add in functionality so that when the column is deleted all its tasks are deleted
  // This means it should prompt the user to ask if they really want to delete everything
}

window.onload = function() {
    getTasks()

    const tsButton = document.querySelector( '#task_submit' )
    tsButton.onclick = addTask

    const ntButton = document.getElementById("add_task")
    ntButton.onclick = makeTask

    const cButton = document.getElementById("cancel")
    cButton.onclick = cancelTask

    const ncButton = document.getElementById("add_list")
    ncButton.onclick = addCol

    const rcButton = document.getElementById("delete_list")
    rcButton.onclick = delCol
  }
