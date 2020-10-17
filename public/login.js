const state = function (e){
  console.log("function accessed")
  const stateDOM = document.getElementById('state')
  
  fetch('/state', {
    method:'GET',
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
  })
  .then( response => response.json())
  .then(json=>{
    console.log(json)
    stateDOM.innerHTML="";
    stateDOM.innerHTML= "You are: "+json['state'];
  })
}


window.onload = function(){
  const stateDOM = document.getElementById('state')
  console.log("accessed the state")
  stateDOM.onload= state();
}