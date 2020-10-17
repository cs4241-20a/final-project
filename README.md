# ItsRainingCows

### Project Members:
- Isaac Abouaf
- Aditya Malik
- Dev Patel
- Abhijay Thammana

### Description
ItsRainingCows allows users to log in, hangout in the lobby with other people, and when ready they can compete against each other in a minigame of dodging the raining cows until everyone is wiped out. Other functionalities of this application are that users can chat with each other in the chat box and view the leaderboard for the highest scores.

### Instructions
Users will just need to login with their previous info they signed up with, or simply create a new username/password and be automatically created an account.
Users can navigate the player in the game using the up/left/right keys on the keyboard.
Click the “Not Ready” button in the bottom right corner to change your player’s state to ready and start the game.

### Technologies
#### Back-end
Node.js Express server that hosts a REST API
MongoDB for persisting user data
Socket.io for bidirectional communication between client and server
#### Front-end
REST API Client carried out with axios
Phaser for graphics rendering, control and logic
What challenges you faced in completing the project.
None of us have ever used Phaser before. The documentation for Phaser was pretty comprehensive, so we were able to learn and complete the game.
Socket.io was also very difficult to learn for us, because we were all first timers.
Multiplayer was a very large challenge. The socket io library we used had a lot of trouble interfacing with Phaser. Phaser allows you to switch scenes, but this caused us to have multiple socket connections with different ids for each of them.
Different time zones (see note below)
What each group member was responsible for designing / developing.
Isaac Abouaf: Leaderboard, login, UI design
Aditya Malik: Authentication/leaderboard
Dev Patel: Chat box
Abhijay Thammana: Phaser Game
A link to your project video.
 
NOTE: Our group struggled with miscommunication errors that led to us submitting the project a little late due to a severe difference in time zones. Our team was spread over the world with a time difference of 8 hours with some members and ran into issues when merging our parts, since it was hard to get availability.

