# Unify
Danya Baron, Connor Burri, Molly Wirtz

Unify is a Spotify comparison app, which takes in two Spotify user IDs and returns the songs in common between the users. Also provided are some additional data analysis, such as top albums in common and the average song popularity of each user's songs, and a real-time global chat functionality. 

link: https://unify-final-project.glitch.me/

### Using Unify

To use this application, first login to spotify using the Login button on the first page. You will be prompted in a new tab to sign in with Spotify, after which you can close the window. If you do not have a personal spotify account, we have created one to test with: 

Username: spotifytest464@gmail.com
Password: SpotifyTest1!
User ID: va7asgfbmjkl2etzjoa93gd61

You may also use our personal Spotify IDs to test with: 
- 8fmej01kfv0584zx6zasc6fwb
- cjbtaco99
- livelaugh22l

A few things to note when using this application: 
- Please enter the Spotify USER ID for this app to function correctly. This is different than the screen name that is displayed, and is often an alphanumeric string. This ID can be located in your Spotify Account Overview page under Username. 

- Unfortunately, due to time constraints, this application does not communcicate server-sider errors to the front-end. Failure to load the content on form submission may be due to an incorrect User ID, a timeout connection to Spotify API, or a non-existing Spotify token (you would have to login again). All errors are, however, logged in the console.

### Technologies
Unify uses React and Bootstrap on the frontend, with a Node backend. Various libraries were leveraged to assist us. In addition, we used Websocket to implement our realtime chat data, and the Spotify API to retrieve our data. 

### Challenges
We faced various challenges in completeing this project, some notable ones being the the chat feature, handling Spotify data correctly, and using the Spotify tokens. 

### Contributions

Danya: 
- Real-time chat
- Login page

Connor: 
- Initial project setup
- Backend
    - Routes
    - Spotify API communications
- Glitch deployment 

Molly: 
- Design
- Homepage 
    - Displaying Spotify data via table & data visulizations
    - Loading icon
- Testing
- ReadMe

### Project Video

https://youtu.be/EOhRxB90UAM
