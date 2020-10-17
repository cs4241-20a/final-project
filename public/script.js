// client-side js, loaded by grocery.html

//username for login
const groupname = document.getElementById("groupname");

//form for finding and creating a group
const groceryForm = document.getElementById("groceryForm");

//form for group to sign in or create new
const groupForm = document.getElementById("groupForm");

//the table element of the cart on the main page
const cartList = document.getElementById("cartTable");

// submit button on the main page
const addGroceryButton = document.getElementById("submit");

const cartListBody = document.getElementById("cartBody");

const pantryListBody = document.getElementById("pantryBody");

const fridgeListBody = document.getElementById("fridgeBody");

const statusButton = document.getElementById("status");

let timedifference = 0;

//objects that a group has
let cartArray = [],
  pantryArray = [],
  fridgeArray = [];

// a grocery object global variable
let groceryobject = null;

//objects that a groceryForm
const groceryItem = document.querySelector("#item"),
  groceryquantity = document.querySelector("#quantity");

let grocerytype = displayRadioValue();

// function for getting the checked radio button
function displayRadioValue() {
  var type_value;
  if (document.getElementById("fridge").checked) {
    type_value = document.getElementById("fridge").value;
  } else {
    type_value = document.getElementById("pantry").value;
  }
  return type_value;
}

//update UI with all data from db
function updateAllTable(json) {
  const id = json._id;
  cartArray = json.cartList;
  fridgeArray = json.fridgeList;
  pantryArray = json.pantryList;
  let update = cartListBody.insertRow(-1);
  cartArray.forEach(groceryitem => updateTable(id, groceryitem, cartListBody));
  fridgeArray.forEach(groceryitem =>
    updateTable(id, groceryitem, fridgeListBody)
  );
  pantryArray.forEach(groceryitem =>
    updateTable(id, groceryitem, pantryListBody)
  );
}

//adds the grocery object to the cart list array, updates it in the database and displays it on the UI
function addToCart(json) {
  alert(groceryobject.item + " successfully added!");
  const id = json._id;
  cartArray = json.cartList;
  cartArray.push(groceryobject);
  json.cartList = cartArray;
  const groupjsonobject = {
    id: json._id,
    groupname: json.groupname,
    cartList: cartArray,
    pantryList: json.pantryList,
    fridgeList: json.fridgeList
  };

  fetch("/modifyCart", {
    //take result sending back in modify cart
    method: "POST",
    body: JSON.stringify(groupjsonobject),
    headers: {
      "Content-Type": "application/json"
    }
  });

  updateTable(id, groceryobject, cartListBody);
}

//adding grocery object to the array when new item added from grocery form
addGroceryButton.addEventListener("click", event => {
  event.preventDefault();

  groceryobject = {
    item: groceryItem.value,
    quantity: groceryquantity.value,
    type: displayRadioValue()
  };

  fetch("/findgroup", {
    method: "POST",
    body: JSON.stringify({ groupname: groupname.value }),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(json => {
      addToCart(json);
    });
});

function changeQuantity(
  json,
  updatedcartArray,
  updatedpantryArray,
  updatedfridgeArray
) {
  const updateqtyjson = {
    id: json._id,
    groupname: json.groupname,
    cartList: updatedcartArray,
    pantryList: updatedpantryArray,
    fridgeList: updatedfridgeArray
  };

  fetch("/updateQuantity", {
    method: "POST",
    body: JSON.stringify(updateqtyjson),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function moveFromCart(
  json,
  updatedcartArray,
  updatedfridgeArray,
  updatedpantryArray
) {
  const updateqtyjson1 = {
    id: json._id,
    groupname: json.groupname,
    cartList: updatedcartArray,
    pantryList: updatedpantryArray,
    fridgeList: updatedfridgeArray
  };

  fetch("/updateArrays", {
    method: "POST",
    body: JSON.stringify(updateqtyjson1),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function deleteItem(
  json,
  updatedcartArray,
  updatedfridgeArray,
  updatedpantryArray
) {
  const updateqtyjson2 = {
    id: json._id,
    groupname: json.groupname,
    cartList: updatedcartArray,
    pantryList: updatedpantryArray,
    fridgeList: updatedfridgeArray
  };

  fetch("/delete", {
    method: "POST",
    body: JSON.stringify(updateqtyjson2),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

//updates UI of one item by adding a row to the table and includes the functions of the delete button
function updateTable(id, json, inputboard) {
  let update = inputboard.insertRow(-1);
  let item = update.insertCell(0);
  let quantity = update.insertCell(1);
  let remove = update.insertCell(2);
  let reducebyone = update.insertCell(3); // reduce the quantity by one with the minus button
  let typeArray = null;
  let newquantity = null;
  let dateBought = null;

  if (inputboard === cartListBody) {
    typeArray = cartArray;
  } else if (inputboard === fridgeListBody) {
    typeArray = fridgeArray;
  } else if (inputboard === pantryListBody) {
    typeArray = pantryArray;
  }

  //deleting button when new item added
  var deleteButton = document.createElement("Button");
  deleteButton.innerHTML =
    '<img src="https://cdn.glitch.com/ece5b26a-f38d-407c-b999-8b42cb13f071%2Ftrash.png?v=1602703842992" width="20px">';
  deleteButton.addEventListener("click", function() {
    const index = typeArray.indexOf(json); //find the index of that item to be moved

    if (index > -1) {
      typeArray.splice(index, 1);
      update.remove();
    }

    if (inputboard === cartListBody) {
      cartArray = typeArray;
    } else if (inputboard === fridgeListBody) {
      fridgeArray = typeArray;
    } else if (inputboard === pantryListBody) {
      pantryArray = typeArray;
    }

    fetch("/findgroup", {
      method: "POST",
      body: JSON.stringify({ groupname: groupname.value }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(json => {
        deleteItem(json, cartArray, fridgeArray, pantryArray);
      });
  });

  var updateButton = document.createElement("Button");
  updateButton.innerHTML =
    '<img src="https://cdn.glitch.com/ece5b26a-f38d-407c-b999-8b42cb13f071%2Fteeth-55-512.png?v=1602788404603" width="20px" id="updatebutton">';
  updateButton.addEventListener("click", function() {
    for (var i = 0; i < typeArray.length; i++) {
      if (
        typeArray[i].item === json.item &&
        typeArray[i].quantity === json.quantity
      ) {
        typeArray[i].quantity = json.quantity - 1;
        newquantity = typeArray[i].quantity;
      }
    }

    if (inputboard === cartListBody) {
      cartArray = typeArray;
    } else if (inputboard === fridgeListBody) {
      fridgeArray = typeArray;
    } else if (inputboard === pantryListBody) {
      pantryArray = typeArray;
    }

    fetch("/findgroup", {
      method: "POST",
      body: JSON.stringify({ groupname: groupname.value }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(json => {
        changeQuantity(json, cartArray, fridgeArray, pantryArray);
      });

    quantity.innerHTML = newquantity;
  });

  update.addEventListener("dblclick", function() {
    const index = typeArray.indexOf(json); //find the index of that item to be moved
    alert("Your item was transferred to your " + json.type)

    dateBought = new Date();

    let temp = typeArray[index];

    if (temp.type === "Pantry") {
      temp.date = dateBought;
      pantryArray.push(temp);
      updateTable(temp.id, temp, pantryListBody);
    } else if (temp.type === "Fridge") {
      temp.date = dateBought;
      fridgeArray.push(temp);
      updateTable(temp.id, temp, fridgeListBody);
    }

    if (index > -1) {
      typeArray.splice(index, 1);
      update.remove();
    }

    if (inputboard === cartListBody) {
      cartArray = typeArray;
    } else if (inputboard === fridgeListBody) {
      fridgeArray = typeArray;
    } else if (inputboard === pantryListBody) {
      pantryArray = typeArray;
    }

    fetch("/findgroup", {
      method: "POST",
      body: JSON.stringify({ groupname: groupname.value }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(json => {
        moveFromCart(json, cartArray, fridgeArray, pantryArray);
      });
  });

  item.innerHTML = json.item;
  quantity.innerHTML = json.quantity;
  remove.appendChild(deleteButton);
  reducebyone.appendChild(updateButton);
  
  if (json.date) {
    let currentDate = new Date();
    let oldDate = new Date(json.date);
    timedifference = (currentDate.getTime() - oldDate.getTime())/(1000 * 3600 * 24);
    if (timedifference > 21 || timedifference === 21) {
      update.style.backgroundColor = "#ff6961" 
    }
    else if (timedifference > 14 || timedifference === 14) {
      // alert(timedifference)
      update.style.backgroundColor = "#ffb347" 
    }
    else if (timedifference > 7 || timedifference === 7) {
      // alert(timedifference)
      update.style.backgroundColor = "#FDFD96"
    }
    
  }
}

// listen for the form to be submitted and add a new dream when it is
// ADD AN EMPTY GROUP TO THE DB OR FETCH THE PRE-EXISTING GROUP FROM THE DB

const findButton = document.getElementById("findGroup");
findButton.addEventListener("click", event => {
  // stop our form submission from refreshing the page
  event.preventDefault();

  fetch("/findgroup", {
    method: "POST",
    body: JSON.stringify({ groupname: groupname.value }),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(
      res => res.json()
      //alert("You've successfully logged into " + groupname.value + "'s Grocery List!")
    )
    .then(json => {
      updateAllTable(json); //updateAllTable
      showGroceryForm(json);
      hideGroupForm(json);
    });
});

const addButton = document.getElementById("createGroup");
addButton.addEventListener("click", event => {
  // stop our form submission from refreshing the page
  event.preventDefault();

  const groupobject = {
    groupname: groupname.value,
    cartList: cartArray,
    fridgeList: fridgeArray,
    pantryList: pantryArray
  };

  // send information from the form to the server
  fetch("/addGroup", {
    method: "POST",
    body: JSON.stringify(groupobject),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(json => {
      showGroceryForm(json);
      hideGroupForm(json);
    });
});

function hideGroupForm(json) {
  var form = document.getElementById("groupForm");
  if (json) {
    if (form.style.display === "none") {
      form.style.display = "block";
    } else {
      form.style.display = "none";
    }
  }
}

function showGroceryForm(json) {
  var form = document.getElementById("groceryForm");
  if (json) {
    form.style.display = "block";
  }
}

const showRecipes = function() {
  console.log("show the recipes");
  const ingredients = { ingredients: "pasta" };
  fetch("/test", {
    method: "GET",
    header: { "Content-Type": "application/json" }
  })
    .then(res => res.json)
    .then(json => {
      console.log("it went through!");
      console.log(json);
    });
};


window.onload = function() {
  console.log("show the page load");
};
