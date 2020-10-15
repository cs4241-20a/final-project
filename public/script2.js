// client-side js, loaded by index.html
// run by the browser each time the page is loaded

// define variables that reference elements on our page
let userForm = document.querySelector("form");
let button = document.getElementById("enter");

 button.onclick = function() {
//userForm.addEventListener("enter", event => {
  // stop our form submission from refreshing the page
  event.preventDefault();

  let first = document.querySelector("#firstname").value;
  let last = document.querySelector("#lastname").value;
  let email = document.querySelector("#email").value;
  let dob = document.querySelector("#dob").value;
  
  fetch("/add", {
    method: "POST",
    body: JSON.stringify({
      firstname: first,
      lastname: last,
      email: email,
      dateOfBirth: dob
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  
  //.then(response => response.json())
   // .then(json => {
     // console.log("user info")
   // });
  // reset form
  //userForm.reset();
   
}
       //);
