# Cheem Chat
For too long chat applications like Slack, Discord and Microsoft Teams has underrepresented those of the cheem kind. To solve this injustice we have made a chat app solely for cheems lovers to interact. In this revolutionary site built with JavaScript, Node.js / Express, MongoDB and React, users can send their favorite cheems to each other inside a persistent and communal chat room. With intuitive leaderboard technologies, users can also compete to be the top chatter and attempt to make their favorite cheem the top doge.  

For those who are unaware of the cheem kind, click [here](https://i.redd.it/tgy4a5n8i9a41.png).

To access the site. click [here](http://cheemchat-wpi.herokuapp.com/#)

**Note:** The site may take a bit to spin up if it is inactive, be patient with Heroku.

Project video [link](https://youtu.be/xcewgcPacOc)

### Team 6
Cheem Chat is brought to you by:
- Samuel Gehly
- Hunter Trautz
- Raymond Dolan
- Gabriel Aponte
- Maria Medina Martinez

## Instructions
**How To: Login**
- Users can log in with two OAuth method: GithHub and DeviantArt
- Users can also login with a Local Strategy by inputting a username and a password
  - If no user with the inputted username exists, a new account will be created and that initial password will be set
  - This method is encrypted with bcrypt, so all passwords are secure and **not** accessible by us developers
  - You will be prompted if the inputted password is incorrect, so don't forget it!

**How To: Chat**
- Choose a cheem image from the scrollable list of choices
- Write a caption in the caption box
- Click the send button

**How To: Upload A Cheem Image**
- Click the Upload A New Cheem button
- In the prompt box, type in an image URL (the URL must be valid!)
  - A valid URL is: 1. An actual URL, 2. A URL that ends with an image file type such as .png or .jpg
  - On successful input, the page will refresh and you can find the new cheem at the end of the cheem scrollable list
- For the developers sake, please only upload cheems and try to avoid any duplicate cheems!

**How to: Leaderboards**
- The User Leaderboard shows which users have the most CheemChats sent
  - A User's counter is updated every time they send a new chat
- The Cheem Leaderboard shows which Cheems have been used the most
  - A Cheem's uses count increments every time said cheem is sent in a chat post

**How to: Logout**
- Click the logout button (Only if you are signed in)

## Technologies Outline
**React UI Library**

For the user interface of the site, we decided that we would utilize React as we all enjoyed working with it for Assignment 4 because of how dynamic and responsive it is. React primarily allowed us to take advantage of its great pre-built and reusable elements and components. Furthermore, React renders our UI in JSX in a way that is fast and scalable to all web browser environments.

**Express Server**
This basic express server powers the main application logic of Cheemchat. It is where the Passport stategies are implemented, where we make calls to Ably and Mongo, and where all the API endpoints live. It uses the express-session, morgan, body-parser, compression, and passport middlewares.

**Ably Realtime**
Ably powers our realtime capabilities as using websockets directly (i.e socket.io) on Heroku is not incredibly stable (as websites go to sleep after a period of time). Ably is SaaS that includes many out of the box features like global network replication, persistence (though we use our own), authentication (we use our own), integrations with other services like Slack, push notifications, webhooks, etc. We chose this as Sam had a lot of experience with it and could set it up without too much headache.

**OAuth with Passport**

We wanted our application to give a wider variety of login options to the user. So, we utilized the passport Express middleware to do so. We implemented both the GitHub and the DeviantArt methods of OAuth login. We choose GitHub since it is standard for our class and DeviantArt simply because it's neat and we wanted to learn more about passport.  

**Local Passport Strategy with bcrypt**

In addition to the OAuth methods of login, we also created a Local Login by utilizing passport as well. This functionality ensures that all users can access the site. However, we didn't want this method to be insecure by saving plain text inside our MongoDB collection. So, we implemented the bcrypt middleware to add secure encryption to passwords. All Local passwords are encrypted and decrypted inside the server to ensure security. Lastly, we made sure to delete the passwords inputted on the UI from their json object after they had been used for logging in.

**Bootstrap CSS Framework**

We leveraged the Bootstrap CSS framework on top of React which gave us access to even more components, effects, Jquery plugins to create the UI. We also used the Facebook create-react-app bootstrap template as a basis for the design.   

**MongoDB**

We utilized MongoDB in order to persist all the data within our site. This included creating three collections. One for user login information, one for holding all the chat messages and one for holding all the Cheem image URLs. The database is also updated every time a chat is added so that leaderboard counts are increment for specific users and Cheems.

## Development Challenges

**Realtime Chat**

Using any third-party service that is as tightly integrated into an application environment is a challenge - troubleshooting why messages would not send, why they would not be received, why API keys wouldn't work or why requests would fail all take a certain amount of time to solve, and using Ably was no exception.

**Bootstrap CSS Framework**

Most of us were used to either writing our own UI with HTML and CSS or utilizing a Classless CSS framework. Since Bootstrap is a Class based framework, it required a decent amount of time reading over documentation about the different class styles and variations. This caused for a lot of trial and error on our part when it came to arranging and spacing UI elements.

**Local Development**

Due to the nature of a real-time chat application, we found local development to be quite challenging. It required running both the server.js file and our frontend build system at the same time. Every so often, the development versions of these systems would clash with each other and render the UI build files to be "not found". This lead to having to refresh the localhost over and over until the page was working. In addition, some of us were unable to automate the build system. So, these team members had to manually rebuild the frontend every time they made a new change and wanted to see/test it.

## Workload Split
- Samuel Gehly
  - Server implementation for Realtime chat functionality
  - MongoDB setup and data management
- Hunter Trautz
  - Lead UI design and implementation of the Bootstrap CSS framework
  - Chat message creation functionality
- Raymond Dolan
  - DeviantArt login functionality and associated UI element(s) design
  - Leaderboard functionality and associated UI element(s) design
- Gabriel Aponte
  - Image upload functionality and associated UI element(s) design
  - Added bcrypt to the local login strategy   
  - Wrote this README
- Maria Medina Martinez
  - GitHub login functionality and associated UI element(s) design
  - Passport Local Strategy functionality and UI element design

## Targeted Users & Stakeholders
- This site targets anyone who loves doges, memes and chatting.
  - Anyone can fall into this categorization, but we feel a demographic of young adults are most attracted to the site.
- As for the stakeholders of our project,... well they are the cheems of course!
