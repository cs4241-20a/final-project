## Groceryify

A web application that manages the food in your inventory and grocery list to track when food is going to expire so that the user can be alerted that they have to use up a food item. It allows for login through Google (through Auth0) and registering for an account with user and password credentials. Through the login, users can join and create groups in which grocery lists can be shared among group members. There is also a chat where users can enter their identifiable name and a message and converse with multiple members about grocery related things.

Link to the website: https://glitch.com/~final-project-007

Link to video: https://youtu.be/oAaSUpDEKOg;

The technologies we used to create our project are Auth0 for the main login page, Svelte for the chat, and Glitch to host Groceryify.

Our team used the following TO-DO List to complete Groceryify's main functionality and these are the methods we used to complete our tasks as well as who did what: In general, Pradnya, Carley, and Kirsten worked on the server work and most of the CSS in the main page while Isabel worked on the Auth0 functionality, CSS, and the login pages.

## Group Tasks for Groceryify
- Chat – CARLEY

- Frontend

- The Landing Page

    Introduction to the platform -- Kirsten

    Designing it: Improving the CSS -- Kirsten + Isabel 

    A section which tells you if you are logged in and Auth0 implementation -- Isabel

- Server + JS
    
    Create/find group setup

    Submit button in the form should update the cartArray in the Database --       Pradnya

    Displaying the data in the cart, pantry, and fridge array to the frontend     (The 3 tables)

          Getting the data from the database to the server

          Sending the data from the server to the frontend

          Sending from the server to the database

          Doing a foreach loop for the arrays and adding the data to the table

- Moving items from the cart to the pantry or the fridge (Button)

  An eventlistener on the button

  Store the object in a variable

  Delete the grocery item from the cartArray

  Date Bought -- Pradnya and Carley

      Add a time field (store it in the js format) to the json object (grocery item) when transferring from the cart to the pantry/fridge

      Create a function to calculate the time passed

            The function should check how many weeks have passed (the developer's choice)

            Change the background color of that specific row: 1=yellow, 2=orange, 3+=red

  Add the grocery item to the pantryArray or the fridgeArray

  Send the updated JSON object: {id: \_\_\_\_, groupname: json.groupname,     cartList: cartArray, pantryList: pantryArray, fridgeList: fridgeArray}

  Use the updateOne function to update the arrays in mongoDB

  Send the updates object back to script.js

  Display the data that is received from the database (standalone helper function) -- Pradnya

  Delete button for all the rows in Cart, Fridge, and Pantry -- Pradnya

  Onclick event for the row of the table

  Remove the JSON object from that specific array

  Send the updated JSON object: {id: \_\_\_\_, groupname: json.groupname,     cartList: cartArray, pantryList: pantryArray, fridgeList: fridgeArray}

  Use the update function in the server to update the deletion in mongodb

  .then to display the deletion in the UI

A minus button for all the rows in Cart, Fridge, and Pantry -- Pradnya

  Onclick event for the – button in the row of the table

  Reduce the quantity of the JSON object by 1 in the specific JSON object in that specific array

  Send the updated JSON object: {id: \_\_\_\_, groupname: json.groupname, cartList: cartArray, pantryList: pantryArray, fridgeList: fridgeArray}

  Use the update function in the server to update the deletion in mogodb

  .then to display the change in quantity in the UI

## Challenges Our Team Faced
Our team faced many challenges in our implementation. These challenges include:

-Getting the chat to work in our Glitch project- we did not have much experience with making web sockets in Javascript, so we went to Prof. Robert's Office Hours for assistance on multiple occasions and were able to get a working chat!

-Modifying the cart in the database correctly- we were calling two fetch methods where there was no guarantee that the first fetch would be called first

- One of the big challenges was designing the database itself- what functions we would need for the website, what structure the database would have including the collections.

-We had to make the website accessible to multiple people at once, so we had to do most of the data processing in the frontend and send it to the server.

-Because of our busy schedules we could not work as much during the day but most of the team pulled all-nighters to get our tasks done.

-Due to busy schedules, we were not able to fully implement the spoonacular API which would display recipes given the ingredients that are in the user's fridge and pantry. 

##Design Tech Achievements

- We used an external authenication API for our login called Auth0 which allows users to create their own accounts and sign in through Google.

- According to our proposal, one of our stretch goals was to have three different boards for the users which were cart, pantry, and fridge board. We were able to implement all three boards, design them, and made them user friendly.

- Another stretch goal was to alert the user about how long it has been since they have bought each grocery item by color coding the grocery items in the UI. Yellow means one week, mustard means two weeks, and red means three or more weeks. This will remind the users about their groceries which are going to go bad and will prevent food waste.

- We made the website accessible by adding big headings, labels to every text input, instructions for inputs, and color guides.




( ᵔ ᴥ ᵔ )
