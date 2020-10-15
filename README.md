# Pictochat V2: Electric Boogaloo

**Jordan Gold, Chris Lee, Jacob Tutlis, William Yang**

Link to website: https://cs4241-fp.herokuapp.com/  

Project Video Link: https://youtu.be/XSkTXzIL88o 

## Project Description

This website may just be the greatest technological achievement in our generation besides of course the original Pictochat. We were able to implement a chat room that allows users to send and create both text and drawings. The main purpose of the chatroom is to be able to chat with other users and send drawn images as an additional form of communication. Users must log in and then join one of four different chat rooms to chat and draw with other users.  

## Additional Instructions

When a user first joins the website they will have to log in with Github then they will be directed to the homescreen. When on the homescreen they are able to join four different chat rooms. Once in a chat room they can use the canvas to draw pictures and send text to other users in the room. When a user leaves the page or disconnects they will automatically be removed from the chat room. If a user’s internet cuts out they may disconnect from the chat and will have to refresh the page to rejoin.  

## Technology Outline

- **Socket.io**: Used for real time communication. Sending and receiving messages in a chatroom is all done with the Socket.io
- **Paper.js**: Used to make a nice drawable canvas with different functionality such as changing brush color and size.
- **Github oauth**: Used to authenticate users for logging in and to set every user's ID.
- **JavaScript**: Used for all basic scripting and communication.
- **Jquery**: Used to simplify the workflow for certain tasks such as adding new items to the list when receiving a message.
 
## Challenges

The CSS was the biggest challenge of the website. It was very hard to have all elements of the page fit correctly on the page while also looking nice and being functional. Things seemed to have a mind of their own and there were a lot of problems designing it.  

## Group Member Responsibilities

- **Jordan Gold**: Implemented drawable Paper.js canvas used to send images. Implemented all drawing tools related to creating your image on the Paper.js canvas. Extended the chatroom to incorporate image sending and receiving.
- **Chris Lee**: Helped create the CSS for the website and set up basic buttons.
- **Jacob Tutlis**: Setup server and socket.io for the client and server. Created the chatroom functionality.
- **William Yang**: Setup Github Oath and login authentication. Helped create the CSS for the website.
