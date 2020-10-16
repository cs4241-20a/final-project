1. A brief description of what you created, and a link to the project itself.
2. Any additional instructions that might be needed to fully use your project (login information etc.)
3. An outline of the technologies you used and how you used them.
4. What challenges you faced in completing the project.
5. What each group member was responsible for designing / developing.
6. A link to your project video.

Think of 1,3, and 4 in particular in a similar vein to the design / tech achievements for A1—A4… make a case for why what you did was challenging and why your implementation deserves a grade of 100%.

1. Our project is a multiplayer pong game with a score chart of each point scored tied to the username entered by a user. This username saves scores associated with it and will show them the next time that same username logs into the game.

**2. Instructions to play the game**

1. Connect to https://ljcook-rmcirella-vebuyck-final-project.glitch.me/ and enter a name, then press the start button.

2. Do the same thing on another computer or tab.

3. ***VERY IMPORTANT STEP*** if you want to run the game again, you have to restart the server. The only way I know how to do this on glitch is by making a small change in the server.js (like an indent) so it restarts.

3. We used mongodb to keep track of highscores, we used websocket to have multiplayer functionality and we used body parser for json parsing.

4. We faced a major challenge in actually getting the multiplayer to work and make sense. Also there were some issues with 
getting the datbase stuff to work the way we wanted it to to hold scores specific to individual users.

5.

Lewis: Responsible for the game itself and the websocket multiplayer

Ryan: Responsible for the database communication and server functions that did so.

Victoria: Responsible for the entirety of the front end and layout.

6. Video Link: https://www.youtube.com/watch?v=-xlS8NLhO1g&feature=youtu.be&ab_channel=Lewiscook
