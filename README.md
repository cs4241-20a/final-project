# cs4241-FinalProject
# Team Members: Jonathan Dang, Ivan Eroshenko, Clay Oshiro-Leavitt, Adrianna Staszewska

1. We created an exciting multimedia experience - Pacpeople. This web application is a modern take on the hit classic - Pacman. This time, there are multiple players and takes place on a larger game board. With up to four human players and 5 monsters, the game can become quite intense and challenging.

Game Link: https://pac-people.herokuapp.com

2. Additional instructions: you can play as a single person, however it is preferable to play with 1-3 other players. You can open up multiple browser windows to test the multiplayer aspect. If two players run into each other they will die.
3. An outline of the technologies you used and how you used them.
4. While working, we quickly discovered the limitations of Ably’s free services. We continually exceeded Ably’s message rates and limits, resulting in several of our accounts being suspended while testing. We also ran into issues with the maximum message size that is allowable over Ably. This required some rework of our message design to fit within the allowable message size.
5. Team Workload:
- Jonathan Dang
  - Handled logic of players colliding with one another
  - Handled the detection of when game ended
  - Helped out with player movement logic
- Clay Oshiro-Leavitt
  - Wall detection and move validation logic
  - Player spawn location logic
  - Player movement logic
  - Integration and composition of game music
- Ivan Eroshenko
  - Implemented UI
  - Helped to give a head start on project implementation
  - Implemented the boss with A*

- Adrianna Staszewska
  - Coin collection by players
  - Updating user’s scores in the database 
  - Movement of monsters 

6. Here is the link to our project demonstration video.
https://youtu.be/Lpv8TB81V8g

