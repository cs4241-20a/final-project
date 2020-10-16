window.onload = function() {
    const githubButton = document.getElementById( 'githubLogin' );
    const submitButton = document.getElementById( 'submitLogin' );

  if(submitButton != null){
    submitButton.addEventListener("click", login);
  }
    
  
}



const login = function( e ) {
    e.preventDefault()
    const userNameField = document.querySelector('#usernameInput');
    const passwordField = document.querySelector('#passwordInput');
    
    var username = userNameField.value;
    var password = passwordField.value;
    console.log("Login attempted with: " + username + " " + password);
    
    var data = {
      username: userNameField.value,
      password: passwordField.value
    };
    
    fetch( '/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify( data )
    }).then(function(response){
      window.location.href = '/';
      //console.log(response)
      //window.location = response.body;
     // response.redirect()
      //console.log(response.url)
    })
  
  }