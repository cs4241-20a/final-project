

1. A brief description of what you created, and a link to the project itself.
2. Any additional instructions that might be needed to fully use your project (login information etc.)
3. An outline of the technologies you used and how you used them.
4. What challenges you faced in completing the project.
5. What each group member was responsible for designing / developing.
6. A link to your project video.

Think of 1,3, and 4 in particular in a similar vein to the design / tech achievements for A1—A4… make a case for why what you did was challenging and why your implementation deserves a grade of 100%.

## FAQs

- **Can I use XYZ framework?** You can use any web-based frameworks or tools available, but for your server programming you need to use node.js. Your client-side language should be either JavaScript or TypeScript.

1. Our project is a pong multiplayer game with high score charts


**Instructions to play the game**

1. If you want to play on multiple computers you MUST change the ip in script.js (on lines 40 and 72) to

*your_ip_adress*:6969 or *your_ip_adress*:8082 for lines 40 and 72 respectively

2. Then to play just run the server on 1 computer (node server.js) and type the url *your_ip_adress*:3000

you can do this on two computers, then all you need to do is login and play!

If you want to just test this on 1 computer you can skip the ip stuff and once the server starts you just type localhost:3000 to the url



Only 2 people can play, if you login with more than 2 people you need to restart the server.


3: we used mongodb to keep track of highscores

We used websocket to have multiplayer functionality

we used body parser for json parsing


4: We faced a major challenge in actually getting the multiplayer to work and make sense, also there were some issue with 
getting the datbase stuff to work the way we wanted it to

5: Lewis: Responsible for the game itself, the websocket multiplayer and finishing touches

Ryan: Responsible for the database communication

Victoria: Responsible for the entirety of the front end

6: https://www.youtube.com/watch?v=Mky3TDtZJTQ&feature=youtu.be&ab_channel=Lewiscook