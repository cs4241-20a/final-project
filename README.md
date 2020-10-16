# cs4241-FinalProject
Team member: Xiaowei Chen,  Yaru Gong, Mingxi Liu, Xiaoyue Lyu, Jialin Song

## Project Description
The team created a web-based real-time video commenting project where users are able to watch the embedded videos inside the web page and share “flying” comments as they watch. There are three videos of choice: music, cooking and talk show. By allowing sharing the real-time comments while users watch the video, the team aims to create a sense of shared watching experience.
Link to the project: 

## Additional instructions
When the users first enter the website, a login page will show up. Users can sign in if they have accounts. Otherwise, they could click the “register” link to sign up for a new account.
After logging into the main page, users can then choose from the three topics and watch the video respectively. Users can then send and read comments while watching the video.

## Outline of Technologies
- Express Node.js server with Middleware packages
  - bodyparser: to handle json objects
  - mongoose: to transmit data with database
  - express-session: to hold user data cross-site from login to main page
  - dotenv: to load environment variables from the .env file
  - serve-favicon: to serve a favicon from specific path
  - passport: to handle user registration and authentication
- Socket server to realize real-time comment sharing functionality
- Persistent user data storage with Mongodb
- Bootstrap CSS framework for an aesthetically clean and appealing website

## Challenges
1. One big challenge was that we were not able to run the project locally because of .env. We spent a whole night trying to figure out how to configure the environment variable on our local computers.
2. Another challenge is to implement with the youtube API. Because we used embedded youtube videos, the iframe API from Google was required to get the user's playing state (pause, play, resume) or playing time of the video. The team finally gave up using this API because it the "events" functionality inside this API failed to work no matter what method we used.

## Work Division
- Xiaowei Chen: Flying comment
- Yaru Gong: Live comment
- Mingxi Liu: CSS, main page
- Xiaoyue Lyu: User Registration
- Jialin Song: CSS, Youtube API (not used) 

## Project Video
Link to the project video: 
