# Modifiable Tic-Tac-Toe : CS4241 Final Project Team 27
## by Tyler Sprowl, Garrett Smith and Phoebe Yeung

http://finalproj-cs4241.glitch.me/


1. DESCRIPTION

    This project sets up a lobby system allowing two players to play tictactoe with each other in a lobby. Lobby creation requires a K x K board size, where K is set by the lobby creator. The win condition for this game is to match K tiles in a row. 

2. INSTRUCTIONS

    Host must specify a name and a (3-9) value for board size. The guest must connect to the host's lobby by using the match ID shown to the host in the second option, and a username in the first option.
        
3. TECHNOLOGIES

    WebSockets (socket.io) were used to create custom board sizes and send other data. JQuery was used to modify properties of the application.

4. CHALLENGES

    Getting websocket to communicate the same information to all users of a lobby, creating custom board sizes, checking games for a winner. Issues arose with websockets when importing to Glitch which Charlie cleared up for another team. What should be delegated to the server and what to the clients was also an issue, our model assumes that clients wont attempt to cheat.
        
5. CONTRIBUTIONS

    Phoebe Yeung was responsible for the user interface including javascript functionality.
    Tyler Sprowl was responsible for the server, code refactorization and some websocket functionality.
    Garrett Smith was responsible for board size modification, some server functions and some js backend.
        
6. PROJECT VIDEO
    
https://youtu.be/iMezVN9ATgo
        
# REFERENCES USED
https://support.glitch.com/t/secure-websocket-server-in-glitch-project/3093

https://stackoverflow.com/questions/10050799/socket-io-websocket-send-message-not-working-with-firefox-and-chrome

https://socket.io/docs/namespaces/

and all of https://socket.io/

https://medium.com/@antoniomignano/node-js-socket-io-express-tic-tac-toe-10cff9108f7

https://dev.to/bornasepic/pure-and-simple-tic-tac-toe-with-javascript-4pgn

https://ayushgp.github.io/Tic-Tac-Toe-Socket-IO/

https://medium.com/@dineshmaxi/understanding-the-use-of-websockets-with-one-example-coding-part-35912679a19b

