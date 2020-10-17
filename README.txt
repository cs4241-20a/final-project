Team 3 - Truman Larson and Ryan Birchfield 
https://team3-final-project-tl-rb.herokuapp.com/ 
https://youtu.be/SKAQZapsG5E : video of app


We have created a draft simulator for league of legends. Users will create a randomized room code and join through there.
The first two clients will be assigned a side to pick from while any additional users will be assigned spectators.
Users will then draft in tournament draft order.
If you are having issues with picking, it is possible that you are selecting when it is not your turn.
This project cannot be used without at least two users, so please keep that in mind. In addition on page reload, you will be identified as a new user and therefore will be put to spectator.
Note: when entering a code, you must click the submit button rather than pressing enter

Yjs was used for multi device communication and server side authentication. Each time a room is created, it creates a new entry in the 
yjs database that contains the state of the draft, and the current pick. There is also an array that store all of the active room codes 
to verify that a newly generated code is not a duplicate.

The backend for this application utilized a websocket server in addtion to a regular simple express server.
 
React was used to deploy the webpage and add interactive elements. In particular using dynamic image tags to add images of champions
required extensive time and effort. Also, the addition of draft logic and spectator modes required significant tweaking.

Challenges faced in completing the project: Deployment to hosting server, url parameters, Draft logic, CSS organization
Truman was in charge of the multi user functionality and backend.
Ryan was in charge of the UI deployment with react and css. 
