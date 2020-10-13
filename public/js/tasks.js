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

  //event.preventDefault()

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
      //if(todo.username == uname)
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
  const col = document.getElementsByClassName('task_lists')
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
  // Need to figure out how to get the button below the cards but for now I'm not worrying about it
  //console.log(col[0])
  //var addBtn = document.getElementById("addTask")
  //console.log("Anything? " + col[0].task_card)
  //col[0].parentNode.insertBefore(div, col.nextSibling)
  col[0].appendChild(div)
}

var addCol = function() {
  //<div class="task_lists">
  //  <h2 class="list_name">List Name</h2>
  const contain = document.getElementsByClassName("inner-container")
  console.log(contain)
  var newCol = document.createElement("div");
  newCol.setAttribute('class', 'task_lists card-panel materialize-red lighten-2')
  var newlistName = document.createElement("h2")
  newlistName.setAttribute('class', 'list_name')
  newCol.appendChild(newlistName)
  contain[0].appendChild(newCol)
}

var delCol = function() {
  const contain = document.getElementsByClassName("inner-container")
  contain[0].removeChild(contain[0].lastChild)
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
