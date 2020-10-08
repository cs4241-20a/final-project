// Add some Javascript code here, to run on the front end.
console.log("Welcome to assignment 3!")
var gitId = null
const submit = function( e ) {
    // prevent default form action from being carried out
    console.log("Submit is called")
    e.preventDefault()

    const name = document.querySelector( '#name' )
    const major = document.querySelector('#major')
    const year = document.querySelector('#collegeyear')
    const number = document.querySelector('#number')
    const password = "".concat(name.value,major.value,collegeyear.value,number.value)

    var json = { 
      name: name.value, 
      major: major.value,
      collegeyear: year.value,
      number: number.value,
      password:password,
      githubid: gitId
    }

    var body = JSON.stringify( json )

    fetch( '/add', {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body 
    })
    .then( function( response ) {
      displayTable()
    })
    return false
  }

  //display the hardcoded exmple data into the page
  const displayTable = function (){
    // clear table before loading new data
    console.log("displatTable is called")
    $('#password_table').find('tbody').empty()
    fetch('/update', {
      method: 'GET'
    })
    .then(response => response.json())
    .then(function(response){
      var server_data = ''
      $.each(response,function(key,value){
        var obj_id = value._id
        server_data += '<tr>'
        server_data += '<td>' + value.name + '</td>'
        server_data += '<td>' + value.major + '</td>'
        server_data += '<td>' + value.collegeyear + '</td>'
        server_data += '<td>' + value.number + '</td>'
        server_data += '<td>' + value.password + '</td>'
        server_data += '<td><button type="button" class="btn btn-danger" id="deleteButton" onclick="deleteData(\'' + obj_id + '\')">Delete</button></td>'
        server_data += '<td><button type="button" class="btn btn-primary" onclick="openForm(\'' + obj_id + '\')">Modify</button></td>'
      })
      $('#password_table').append(server_data)
    })
  }

  const deleteData = function(id){
    fetch('/delete', {
      method: 'POST',
      body:JSON.stringify({id}),
      headers: { 'Content-Type': 'application/json' },
    })
    .then(function(response){
      console.log("delete is called on id: "+ id)
      displayTable()
    })
  }

  const modifyData = function(id){
    const name = document.querySelector( '#mName' )
    const major = document.querySelector('#mMajor')
    const year = document.querySelector('#mCollegeyear')
    const number = document.querySelector('#mNumber')
    const password = "".concat(name.value,major.value,collegeyear.value,number.value)

    var json = { 
      name: name.value, 
      major: major.value,
      collegeyear: year.value,
      number: number.value,
      password:password,
      id
    }
    var body = JSON.stringify( json )
    console.log(body)
    fetch( '/modify', {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body 
    })
    .then( function( response ) {
      console.log("modify is called on id: "+id)
      displayTable()
    })
    document.getElementById("modifyForm").style.display = "none";
    return false
  }

  function openForm(id) {
    //console.log("open the form")
    document.getElementById("modifyForm").style.display = "block";
    const modify_button = document.querySelector( '#submitModification')
    modify_button.onclick = function(e){
      modifyData(id)
      e.preventDefault()
    }
  }

  function closeForm(e) {
    e.preventDefault()
    document.getElementById("modifyForm").style.display = "none";
  }

  const logout = function(key){
    fetch('/logout',{
     method: 'POST', 
     credentials: 'same-origin' 
   })
    .then(function(response){
      if(response.redirected){
        window.location = response.url
      }
    })
  }


  const getId = function(){
    fetch('/githubid',{
     method: 'GET', 
   })
    .then(response=> response.json())
    .then(function(response){
      gitId = response
      console.log(`githubid:${gitId}`)
    })
  }

  window.onload = function() {
    const submit_button = document.querySelector( '#submitButton' )
    const close_popup = document.querySelector( '#closeModification' )
    const logout_button = document.querySelector('#logout')
    getId()
    close_popup.onclick = closeForm
    submit_button.onclick = submit
    logout_button.onclick = logout
    displayTable()
  }
