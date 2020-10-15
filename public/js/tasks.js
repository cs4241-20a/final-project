// Get the modal
var modal = document.getElementById("myModal");
var editmodal = document.getElementById("editModal");
var card1=document.getElementById("card1")
var btnContainer=document.getElementById("btn_container")

var clicked=false

var makeTask = function(column) {
  modal.style.display = "block";
  currentCol = column
}

var cancelTask = function(){
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (modal === event.target) {
    modal.style.display = "none";
  }
}

var openTask = function(task, edit) {
  if(edit == true) {
    editmodal.style.display = "block";
    const input = document.querySelector( '#t_name' )
    const input2 = document.querySelector( '#due__date' )
    const input3 = document.querySelector( '#t_assignee')
    const input4 = document.querySelector( '#t_tags')
    const input5 = document.querySelector( '#t_desc')
    input.value = task.task
    input2.value = task.duedate
    input3.value = task.assignee
    input4.value = task.tags
    input5.value = task.description
  }
}

var listClicked = function(){
  if(clicked){
    btnContainer.style.display="none"
    clicked=false
  }else{
    btnContainer.style.display="block"
    clicked=true
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
      if(task.column > cols) {
        console.log("We need to add a new column")
        addCol()
      }
      appendNewInfo(task)
    }
  })
}

//What column are we adding to?
var currentCol = 1;

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
  const json = { group: name, task: input.value, duedate: input2.value, assignee: input3.value, tags: input4.value, description: input5.value, column: currentCol }
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
  modal.style.display = "none";
}

var editTask = function (e) {
  e.preventDefault()
  //Edit the task
  const input = document.querySelector( '#t_name' )
  const input2 = document.querySelector( '#due__date' )
  const input3 = document.querySelector( '#t_assignee')
  const input4 = document.querySelector( '#t_tags')
  const input5 = document.querySelector( '#t_desc')

  tEdit = ids[ids.length-1]
  tEdit.task = input.value
  tEdit.duedate = input2.value
  tEdit.assignee = input3.value
  tEdit.tags = input4.value
  tEdit.description = input5.value

  fetch( '/edit', {
         method:'POST',
         body: JSON.stringify(tEdit),
         headers: {
          "Content-type": "application/json"
        }
    })
    .then( function( response ) {
      location.reload()
    })
}

function delTask(task) {
  fetch('/delete', {
    method: 'POST',
    body: JSON.stringify({id: task._id}),
    headers: {
      "Content-type": "application/json"
    }
  })
  .then( function( response ) {
    location.reload()
  })
}

// Tells us which task was just clicked on
const ids = []

function appendNewInfo(task) {
  // Create elements
  var div = document.createElement("div");
  var name = document.createElement("p");
  var due = document.createElement("p");
  var assigned = document.createElement("p");
  const col = document.getElementsByClassName('tasks')
  var btnDiv = document.createElement("div");
  var deleteBtn = document.createElement("a")
  var del = document.createElement("i")
  // Are we editing?
  var editing = true
  // Set attributes
  div.setAttribute('class', 'task_card card-panel col s1')
  name.setAttribute('class', 'task_item')
  due.setAttribute('class', 'task_item')
  assigned.setAttribute('class', 'task_item')
  del.setAttribute('class', 'material-icons right')
  deleteBtn.setAttribute('class', 'centerwaves-effect waves-light btn-small btn')
  btnDiv.setAttribute('style', 'display:flex; flex-direction: row; justify-items: center')
  // Add things
  del.appendChild(document.createTextNode("delete_forever"))
  deleteBtn.appendChild(del)
  deleteBtn.onclick = function() {
    delTask(task)
    editing = false
  }
  btnDiv.appendChild(deleteBtn)
  name.appendChild(document.createTextNode(task.task))
  due.appendChild(document.createTextNode(task.duedate))
  assigned.appendChild(document.createTextNode(task.assignee))
  div.appendChild(name)
  div.appendChild(due)
  div.appendChild(assigned)
  div.appendChild(btnDiv)
  div.onclick = function() {
    console.log(editing)
    openTask(task, editing)
    ids.push(task)
    console.log(ids[ids.length-1])
    editing = true
  }
  col[task.column-1].appendChild(div)
}

//The total number of columns
var cols = 1;

var addCol = function() {
  const contain = document.getElementsByClassName("inner-container")
  //console.log(contain)
  cols++ //update number of columns
  console.log(cols)
  // Create all the necessary elements
  var newCol = document.createElement("div");
  newCol.setAttribute('class', 'task_lists card-panel materialize-red lighten-2')
  var newList = document.createElement("div")
  newList.setAttribute('class', 'tasks')
  newList.setAttribute('id', cols)
  var newlistName = document.createElement("h4")
  newlistName.setAttribute('class', 'white-text center-align row')
  var addBtn = document.createElement("a")
  addBtn.setAttribute('class', 'add_task centerwaves-effect waves-light btn-large')
  addBtn.setAttribute('type', 'centerwaves-effect waves-light btn-large')
  var colID = "btn-" + cols
  addBtn.setAttribute('id', colID)
  var plus = document.createElement("i")
  plus.setAttribute('class', 'material-icons right')
  // Add everything
  plus.appendChild(document.createTextNode("add"))
  addBtn.appendChild(plus)
  addBtn.appendChild(document.createTextNode(" New Task"))
  addBtn.onclick = function() {
    makeTask(cols)
  }
  newlistName.appendChild(document.createTextNode("New List"))
  newCol.appendChild(newlistName)
  newCol.appendChild(newList)
  newCol.appendChild(addBtn)
  newCol.onclick = listClicked
  contain[0].appendChild(newCol)
}

var delCol = function() {
  const contain = document.getElementsByClassName("inner-container")
  contain[0].removeChild(contain[0].lastChild)
  cols--
  // Later on we'll add in functionality so that when the column is deleted all its tasks are deleted
  // This means it should prompt the user to ask if they really want to delete everything
}

window.onload = function() {
    getTasks()

    const tsButton = document.querySelector( '#task_submit' )
    tsButton.onclick = addTask

    const ntButton = document.getElementById("btn-1")
    ntButton.onclick = function() {
      makeTask(1)
    }

    const cButton = document.getElementById("cancel")
    cButton.onclick = cancelTask

    const ncButton = document.getElementById("add_list")
    ncButton.onclick = addCol

    const rcButton = document.getElementById("delete_list")
    rcButton.onclick = delCol

    const teButton = document.querySelector( '#task_edit' )
    teButton.onclick = editTask
  }
