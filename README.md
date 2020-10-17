# cs4241-FinalProject
## Authors
  1. Jordan Stoessel
  2. Christian Tweed
  3. Song Zhecheng

#### Chat Party
https://final-project-team21.glitch.me/


- The application is a chat party system that allows a user to host or join a party room. Messages that are sent in the party room are received by other users within the same room. Users prior to joining party rooms are able to register an account or log into a pre-existing account. Non-existing accounts entered on the register page are placed into the database while login checks the database prior to authenticating. The chat room updates in realtime to allow for seamless chatting.

## Project ideation
For this project we wanted to create some sort of game or chat system. Our project originally to be made for people who want to hangout with friends online and play a game of Battleship. We also were trying to implement a way for random players to join each other's sessions. This was to allow both friends to play with friends and die-hard board gamers to play games with other strangers over the internet. 

- We made us of MongoDB, React, Bootstrap, NodeJS, express, bcrypt, yarn, and passport. MongoDB was used as a database for storing user information such as usernames and password hashes. React is a library that was used for building the interfaces for the website and designing certain components. Bootstrap is a CSS based framework which allows for website responsiveness. NodeJS was a requirement but was used for creating the server alongside express. Express was used to make implementing a server more simple. bcrypt allowed for password hashing so passwords could be properly and securely stored in the database. yarn was used to help with generating React builds and testing changes. Passport is authentication middleware which was used to authenticate requests in the server.

- There were many challenges that were faced in this project. We didn't realize the due date for the proposal was the 6th week of the term instead of the 7th week. Another problem we faced was dealing with differing timezones. We tried to have proposals done as soon as possible, but we couldn't get a hold of ZheCheng for a while which put us behind a bit further. Our messages to each other would basically be read 12 hours later when either of us were available. Our project originally was to be a game of Battleship, but due to time constraints didn't work out. The progress with the Battleship app code was left in the repository to show our implementations of clean UI. Though the original project didn't work, we tried to implement as many of the original ideas and technologies. Definitely the most challenging topic with this project was trying to split a workload over the internet with differing timezones. We tried to do work as early as we could, but the timezones made our preparation phase take a lot longer. In the end, we didn't have enough time to finish the project alongside the other requirements in other classes.

-  Other challenges that we faced were trying to adapt to React after only using it for 1 week or not at all prior. This set us behind even further. 

### Team formation

- Tweed developed the backend server, imported technologies, and dealt with web sockets. He created links between the pages and also created lobby code generation. Imported the Navbar from React.

- Jordan designed the login, register, and HowToPlay pages and dealt with css across multiple pages. Set up initial HTMLs which became outdated with the shift to React.

- ZheCheng converted Jordan's initial HTMLs to React and created two grid components for the Battleship app's Player and Enemy grid. 

### Video Link below:
https://youtu.be/X4zor6AI5Zk

### Similarities to other projects
This project made use of tidbits from all of the previous projects. We have static pages which is linked to Project 1. We also have connection from frontend to a server and database (with express) which makes use of Project 2 and 3. We utilized React which shares the similarities to Project 4's components requirement. A lot of planning went into the creation of this app, but with the time restraints we were not able to completely finish the application. Though we did not finish on time, we learned a lot from this class and the processes of developing web applications.
