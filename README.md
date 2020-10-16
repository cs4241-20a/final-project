# Enlighten Me

We created an application that fosters the understanding and communication of parties
that disagree. Users log in with a username and password (if there is no account with that
username a new account is created). When the round starts the user votes on whether they
disagree, agree, or have no opinion on the current topic. For the next four minutes and
twenty seconds the users can chat amongst themselves to understand the opinions of others
and to communicate their own beliefs about the topic. If a user posts a comment that
another user has strong feelings about, they can +1 or -1 the comment score. In the last
twenty seconds of the round the users can vote for which category to get the next topic
from: Politics, memes, food, or miscallaneous. The users also vote about whether they
disagree, agree, or have no opinions on the topic. In the last five seconds, statistics
on pre-round and post-round voting are posted so users can see how everyone who participated
in the round voted. No log in information is required, make your own account.

## Technologies used

- WebSockets: to implement chat, comment voting, pre and post round voting, displaying
statistics
- Bootstrap: to implement an aesthetically pleasing interface
- Node.js: to implement a server using express
- express-sessions: to implement users logging in and out

## Challenges Faced

Deciding how to implement comment voting was a challenge. There were two routes we could take:
send data to our database, or keep the information on the server and use websockets to
relay comment voting score. Since the comments delete every round, there is no use in keeping
a database filled with these comments and their scores. Besides, why use clunky fetch
requests when websockets are much smoother to use. We implemented comment voting by
sending a websocket message that included whether the vote was an upvote or downvote and
what the comment number of the comment was. The server then kept track of all the comments
in an array and when it received a comment vote websocket message, it updated the score,
and sent the new comment's score to all the clients connected to change the score in real time.

## Teammate Responsibilities

- Sam Moran: Implemented chat through websockets, implemented pre- and post- round voting
- Mario Castro: Designed front-end of site, printed timer statistics to frontend, implemented login funcitonality
- Ioannis Kyriazis: Implemented comment voting through websockets, responsible for making site screen-reader friendly,
implemented category voting

Project Video Link: https://www.youtube.com/watch?v=U4n2_0Dv1f0&ab_channel=MarioCastro

