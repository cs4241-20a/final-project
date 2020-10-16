CS4241 Team 9 Final Project - Connect Four
===

Link to the project video: 
Link to the webesite hosted on Glitch: https://team9-final-project.glitch.me/

# Project Description
Our project is a web app that allows users to play Connect 4. Whenever a user logs in, they're randomly matched with another user. The two players can play a full game of Connect 4 and chat with each other. 

# Instructions
1.) Enter a username and log in.
2.) Wait for another player to log in. If you want to play with yourself, you can just open a duplicate tab and log in with a different name.
3.) To make a move when it's your turn, click the button underneath the column you want to place your piece in.

# Technologies Used
 - **WebSockets** was used for client and server communication. This allowed the server to send
 messages to clients without the clients having to make API requests. This was sueful for cases
 where the other player logged in or made a move, so the first client had to be notified.
 - **Backend**
   - An express server was used to get a simple game server up and running using node.js
 - **Frontend**
   - The Bulma CSS framework was used to style both pages

# Challenges
- Random player matching
  - The biggest issue with matchmaking was the redirection that takes place after players are
  put in a match. When they are redirected to gameBoard.html, the websocket that was open on the
  login page closes, meaning we can no longer use that websocket for sending game moves. After
  some time researching and testing different ways of transferring values between pages, we 
  ended up passing the username in the URL (/gameBoard?name=). When the user loads into 
  gameBoard.html, they make a new websocket and, on open, tell the server their username. The
  server will find their username in the list of games and update its socket reference to use the
  player's new socket.
- Chat messages
  - For chat messages, the biggest challenge was getting the websockets set up to allow
  for communication back and forth. Since Websockets was new to all of us, it required us
  to learn it while we were creating the project.
- Sending the same game state information to both players
  - To do this, we had to figure out how to associate the two different players that were put
  into a match as well as their two WebSockets. We used an array of objects which store both
  usernames and sockets so it's easy to get the socket a message needs to be sent to. In the
  JSON objects that are written on the sockets, we use a subject line to differentiate between
  the purposes of the different messages.

# Group Member Responsibilties
Each group member was responsible for the following:
- **Alex**
  - Created login page layout
  - Wrote front-end JS for game logic (including win condition checking)
  - Tweaked layout of game board page (displaying which color the player is, aligning chat box)
- **Nina**
  - Set up server-side login
  - Implemented front-end board updating
  - Disconnect from game functionality
  - Implemented move making (piece falls to lowest available spot in column)
- **Nicole**
  - Created the game board layout
  - Fixed Users errors (disable login button once submitted, display who's turn)
- **Joe**
  - Set up Websockets on client and server
  - Set up chat messages to be sent back and forth between players
  - Wrote the front-end code for the chat box
  - Wrote front-end Javascript to update the board whenever moves are made
