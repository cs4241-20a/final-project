# Project Title: Bubble

**Hosting Link:** [https://cs4241-a20-team-28.glitch.me/](https://cs4241-a20-team-28.glitch.me/)

[**Video Link**](https://youtu.be/epEMZzjsqcg)

**Team Members:** Haley Hauptfeld, Ann Jicha, Matthew St. Louis

## Project Description: 

Our project is a video chat web application called ‘Bubble’. Users can connect with peers over video and audio through bubbles that are similar to meeting rooms. Our application is similar to the popular video chat app, Zoom, but we added different functionality to make it more user-friendly. Our application differs from Zoom in that users can switch from one video chat “bubble” to another in real time. This makes it easier to chat with different smaller groups of people within a large crowd at the same time, unlike Zoom’s breakout rooms, which can only be controlled by the host of a meeting. In regards to our tech stack, we used MongoDB for our database, Express as middleware, and the Angular framework for our front-end. We also used GitHub OAuth for user authentication. We used the simple-peer library to integrate WebRTC into our application so that users can chat through video and audio. We also used web sockets to send information between users within the same bubble.

## Additional Instructions: 

The application comes with some instructions on the info (i) button on the home page, but there is a bit more functionality to explain if you try to grade it. 

The app can successfully connect the audio and video of two users, but it can currently only do so for two users, and these must be the first two users to connect over the server. We tried to add in some code to account for peers that drop out of the network, but it was unsuccessful. If you want to test this out for grading, you can try it once per server reset. To reset the server, re-import the project from mastlouis/final-project:. (note the period) on [Glitch](https://glitch.com/edit/#!/join/5008e916-8497-4836-a7b6-74525a801cc9). You only have to do this if you would really like to see the peer-to-peer communication in action.

Furthermore, for peer-to-peer communication to work, only hit the "Connect" button to connect your video feed. Do not join a bubble, as this will remove your current connections. This was done to help a user leave a bubble.

We attempted to write the logic to allow users to enter and leave bubbles using uuid's that the server assigns, manages, and distributes back to clients as needed, but we were unable to connect users after this, as further detailed in the [challenges](#challenges) section.

## Challenges: 

Our team ran into a lot of challenges with getting web sockets to work in regards to sending information between two users within a bubble. Due to the time restraints of the project, we were unable to fully implement the concept of entering a bubble and communicating between two users within a specific bubble. However, if we had more time to implement our project, this is the blocker that we would continue to tackle. If we had more time to debug this issue, we would pinpoint our problem towards implementing web sockets properly. We completed a lot of research on how web sockets work, and saw many successful Angular implementations that created a WebSocket service. We had the parts and pieces that are necessary for implementing WebSockets in order to create connections between peers that exist within a bubble. However, we were unable to make those pieces connect. If given more time, this is where we would focus our energy.

In regards to specifically what we accomplished with setting up logic for bubbles, we were able to have new clients connect to a bubble and have the server send the new client a list of ids of all the other connected clients in that bubble. We also created a simple-peer instance for each user within the bubble. In regards to the next steps we would have taken, we would tackle how the signal is generated for each peer and to send that to the server along with the client id of where the offer is supposed to go. This is actually the step that we got stuck on. After that, we would have told the client id of the new client that made the offer so that the answer includes which client originally made the offer. This would finish the implementation of the bubble because it would establish a full connection between solely the users that exist within one bubble.

A challenge that we were able to overcome was creating a peer-to-peer video and audio connection through the simple-peer library(https://github.com/feross/simple-peer) and WebRTC. We tried researching and combing through tutorials related to this subject, but it was pretty difficult to find accurate tutorials, especially in the context of Angular, which is the framework that we implemented within our front-end. The main reason that it was difficult to learn from tutorials in Angular was because there are several versions of Angular. Therefore, tutorials from earlier years contain lots of deprecated code. This deprecated code that no longer works with the latest version of Angular was confusing because the logic it takes to connect different pieces of a project slightly changes with each version of Angular. This started to become a very difficult hurdle to overcome. We came to a point where we started researching how to implement WebRTC and simple-peer in vanilla JS, which was still beneficial to our overall project because it gave us a better understanding of how these technologies work. In fact, our understanding of WebRTC and simple-peer became so thorough that we were actually able to still implement our project using Angular since we had a solid base of how to use these technologies in any context.

In the final stages of the project, the entire group worked in a peer programming system, rotating the so-called “driver”, in order to attempt to work through the most difficult logic. Through this approach, we gained a collective understanding of simple-peer and what we were able to implement.


## Team Member Responsibilities:

**Haley Hauptfeld:** Haley researched how to implement WebRTC, web sockets, and the simple-peer library. These are all technologies that the entire group had never used before, so research was integral to our understanding of how to implement our project. Haley was also responsible for beginning the implementation of having users enter different bubbles, as opposed to one global chat room.

**Ann Jicha:** Ann also researched how to implement WebRTC, web sockets, and the simple-peer library. Again, these are all technologies that the entire group had never used before, so this was integral to our understanding of how to implement our project. Ann started the base implementation of WebRTC for solo video that was eventually finished by Matt and worked with Haley on bubble implementation. Ann was also responsible for implementing GitHub OAuth into our application for user authentication purposes.

**Matthew St. Louis:** Matt designed the entire UI using Angular in a very clean way. In addition to being completely responsible for the structure of our UI, Matt was also mainly responsible for setting up WebRTC to get a solo video to show up. Matt was also responsible for doing peer-to-peer implementation of setting up connections between videos of two different users. Matt also worked with Haley and Ann on implementing the logic for users to enter different bubbles.

## Resources*:
- https://github.com/feross/simple-peer
- https://github.com/borjanebbal/webrtc-node-app
- https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications
- https://livebook.manning.com/book/angular-development-with-typescript-second-edition/chapter-13/86
- https://glitch.com/edit/#!/webrtc-video-simplepeer?path=server.js%3A1%3A0
- https://web.microsoftstream.com/video/8a327733-925d-4238-9748-ca758ba57905
- https://web.microsoftstream.com/video/440d03b4-439c-412a-bc41-94b369e5964c
- https://web.microsoftstream.com/video/69cee54d-ba59-446c-9289-deb122e08f53
- https://tutorialedge.net/typescript/angular/angular-websockets-tutorial/
- https://javascript-conference.com/blog/real-time-in-angular-a-journey-into-websocket-and-rxjs/
- https://medium.com/briebug-blog/making-use-of-websockets-in-angular-way-easier-than-you-expected-25dd0061db1d
- https://dimitr.im/websockets-angular
- https://tutorialedge.net/typescript/typescript-socket-io-tutorial/
- https://www.youtube.com/watch?reload=9&v=POzZ0-y2ZX8&ab_channel=CodeKul
- https://tutorialedge.net/typescript/angular/angular-socket-io-tutorial/
- https://medium.com/factory-mind/websocket-node-js-express-step-by-step-using-typescript-725114ad5fe4
- https://www.sitepoint.com/webrtc-video-chat-application-simplewebrtc/
- https://www.cometchat.com/tutorials/angular-voice-video-chat
- https://scotch.io/tutorials/build-a-video-chat-service-with-javascript-webrtc-and-okta
- https://www.nexmo.com/blog/2020/05/08/create-a-basic-video-chat-app-with-asp-net-and-angular-dr
- https://medium.com/@Anderson7301/building-a-video-chat-app-with-agora-and-angular-6-858d72b6fa0d

*This is a list of videos, tutorials, and other content that we studied and referenced to either partially implement into our project or to just give us a deeper understanding of the frameworks and libraries that we used within our tech stack. Some of these resources were given to us from class, but the majority of them are from independent research.

