// Get the modal
var modal = document.getElementById("myModal");

const newTask = function() {
  modal.style.display = "block";
}

const cancelTask = function(){
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (modal === event.target) {
    modal.style.display = "none";
  }
}

const addTask = function (e) {

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
      //var count = 0
      //var tableCount = tbod.rows.length
      var task = json
      appendNewInfo(task)
  })
}

function appendNewInfo(task) {
  //<div class="task_card">
    //<p class="task_item" class="task_name">Task Name</p>
    //<p class="task_item" class="task_date">Due Date</p>
    //<p class="task_item" class="assignees">Assigned To</p>
  //</div>
  var div = document.createElement("div");
  var name = document.createElement("p");
  var due = document.createElement("p");
  var assigned = document.createElement("p");
  const col = document.getElementsByClassName('list_name')
  name.setAttribute('class', 'task_item')
  due.setAttribute('class', 'task_item')
  assigned.setAttribute('class', 'task_item')
  name.appendChild(document.createTextNode(task.task))
  due.appendChild(document.createTextNode(task.duedate))
  assigned.appendChild(document.createTextNode(task.assignee))
  div.appendChild(name)
  div.appendChild(due)
  div.appendChild(assigned)
  col.appendChild(div)
}

window.onload = function() {
    const tsButton = document.querySelector( '#task_submit' )
    tsButton.onclick = addTask

    const ntButton = document.getElementById("addTask")
    ntButton.onclick = newTask

    const cButton = document.getElementById("cancel")
    cButton.onclick = cancelTask

    //const button2 = document.querySelector( '#edit' )
    //button2.onclick = edit

    //const button3 = document.querySelector( '#delete' )
    //button3.onclick = remove

    //const button4 = document.querySelector('#signout')
    //button4.onclick = signout
  }
