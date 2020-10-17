


// adder
// Get the modal
var modal = document.getElementById("addpop");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementById("closeAdder");

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
};

function doAdd(e) {
  e.preventDefault();

  const vocab = document.getElementById("vocab").value;
  const definition = document.getElementById("definition").value;
  console.log("vocab: " + vocab);
  console.log("def: " + definition);
  
  fetch("/api/import", {
    method: "POST",
    body: JSON.stringify({
      data: vocab+':'+definition
    }),
    headers: { "Content-Type": "application/json" }
  })
    .then(response => response.json())
    .then(result => {
      if (result.code === 200) {
        modal.style.display = "none";
      } else {
        alert(result.msg);
        console.log("fail")
      }
    });
}

//editer
var editModal = document.getElementById("editpop");
var edtBtn = document.getElementById("edit");
var editspan = document.getElementById("closeEditer");

edtBtn.onclick = function() {
  editModal.style.display = "block";
};

editspan.onclick = function() {
  editModal.style.display = "none";
};

function doEdit(e) {
  e.preventDefault();

  const vocab = document.getElementById("search").value;
  
  fetch("/api/search", {
    method: "POST",
    body: JSON.stringify({
      keyword: vocab
    }),
    headers: { "Content-Type": "application/json" }
  })
    .then(response => response.json())
    .then(result => {
      if (result.code === 200) {
        document.getElementById("searchBoard").style.visibility = "hidden";
        document.getElementById("resultTable").style.visibility = "visible";
        let resultTable = document.getElementById("resultTb")
        
        for (let i = 0; i < result.data.length; i ++) {
          let row = resultTable.insertRow(-1);
          let cell1 = row.insertCell(0);
          let cell2 = row.insertCell(1);
          cell1.innerHTML = result.data[i].title;
          cell2.innerHTML = result.data[i].content;
          cell1.contentEditable = 'true'
          cell2.contentEditable = 'true'
        }
        document.getElementById("esBtn").innerHTML = "save"
      } else {
        alert(result.msg);
        console.log("fail")
      }
    });
}



window.onclick = function(event) {
  if (event.target == editModal) {
    editModal.style.display = "none";
  } else if (event.target == modal) {
    modal.style.display = "none";
  }
};
