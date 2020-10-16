# Team 8

**By:** Noah Parker, Sean Morrissey, Malek Elshakhs, Eric Reardon, and Rory Sullivan

## cs4241-FinalProject: el gemO WebApp

**Glitch Live App Link:** https://el-gemo-team8.glitch.me

**Summary:** Team 8's el gemO application is intended to be used as a video streaming/chatroom service.
With our current learning environment strongly impacted by COVID, we recognize the importance of online communication services and forums.
We aimed to create an application similar to Zoom/Omegle where individuals could create private rooms to meet and communicate virtually.

**Login:** When our webapp loads, a user is brought to a login page. From here, a user can login if they already have an account or create a new one.
To create a new account, a user must type in a unique email address and a password. If the email address has already been used to create an account, an error will be thrown.
When a new account is created, our app sends a Post request to our MongoDB database, where all of our user accounts are stored.
After creating an account, a user can login with their email and password. To log in, I utilized the 'passport' library to authenticate an account is present with the given username/password.
From here, they will be redirected to the main page of the application.<br/>
**Contributing Members:** Eric Reardon & Sean Morrissey

**Creating/Joining Chat Rooms:** Users have the ability, once their camera is enabled, to create chat rooms. The way creating a room works is by sending a post
request to the nodeJS server which will as a result creates a room in a table with the given ID, and update the members of that room to include the person who created it.
The way joining a room works is by sending a post request to the nodsJS server which will find the room in the table with the given ID, and update the members in that room
to include the member who is joining. Once a member joins a room, they will use peerJS to call the other users in their room, and send them their video streaming
data. Once users recieve a call from other peers, they know to update the list of people in their current chat room to include the Id of the caller. That means that after a
user creates or joins a room, there is no longer a need for that user to communicate with the nodeJS server. Finally, when users recieve call requests from other peers, they
create a video element on the screen and populate it with the peerJS streaming data that was sent to them. <br/>
**Contributing Members:** Noah Parker & Rory Sullivan

**Chat:** The chat works by sending a peer to peer connection through PeerJS to every user already in the room once you join. On the callback for this connection, the users
already in the room will connect back to you. All connections are stored in a local array which is looped through each time you send a message to send your username and
message to each other member of the room. This array is also used to make sure on the callback there is not an infinite loop. it checks whether a connection to that user
is already present in the list before trying to make a new connection otherwise if the connection already exists, it does nothing instead. On receiving a message, it adds
the message to the local chat as a new child of the chatbox. <br/>
**Contributing Members:** Malek Elshakhs & Eric Reardon

**Layout & Design:** Taking inspiration from services like Zoom, Omegle, and Twitch, we layed out the website between two main portions: Login and WebApp. The WebApp is split between the user videos, ways to connect,
and the chat. The Login is a basic login similar to what most websites have, it is nothing particularly special. All of our website's design and layout was built alongisde bootstrap 3 components. All the animations and transistions were done
using Jquery. In addition, we decided to keep our WebApp to one webpage as it made our overall structure less complicated and keep state of the website static.<br/>
**Contributing Members:** Sean Morrissey

**Challenges Faced:** One of the challenges encountered while developing this project involved when a user refreshed the page or closed the window,
while in a chatroom with other users. The leaving user's video stream would freeze and remain on the page. So solve this problem, a timeout/keepalive system was developed,
which uses the chat system and periodically sends messages, asking for a reply to signify if a peer is still connected. When a peer has not replied to several keepAlive messages,
their video element will be removed from the page automatically.<br/>
**Contributing Members:** Noah Parker & Rory Sullivan
