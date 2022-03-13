# Adversary
_Beat the challenge... and your friends._

Adversary is a community-driven code challenge site that lets users submit code challenges for other people to attempt to solve. Adversary also gives users the ability to compete in "code races" where users try to solve a code challenge faster than anyone else in their group. Code solutions are run by the server in a sandboxed environment.

Glitch link: https://2020a-webware-group-20.glitch.me/

Note: This site may take unusually long to start up. This is Glitch's fault because of the weird ways it handles `node_modules` not playing very nicely with our project. If it does not start up after quite a while (like a minute), contact Trevor Paley.

## Technical notes
* If running on your machine, run `npm install` both in the root AND `backend` directories. Run `npm run build` in the root directory to compile the frontend.
* To develop on your local machine with a watch, run `npm install` as above and then run `npm run watch` in the root directory.
* If running on an HTTPS server (such as on Glitch), you will need to change this line in `frontend/js/components/WebSocketProvider.tsx`:  
    ```js
    const ws = new WebSocket(`ws://${location.host}`);
    ```
    To:
    ```js
    const ws = new WebSocket(`wss://${location.host}`);
    ```
* `.env` (placed in the root directory) requires the following fields:  
    ```
    DB_USER=MongoDbUser
    DB_PASSWORD=MongoDbUserPassword
    DB_HOST=MongoDbHost
    DB_DATABASE=DbConnectionQueryString
    SESSION_SECRET="Any secret to be used for signing sessions"
    ```
* If running on Glitch, you may need to change this line in `package.json`:  
    ```json
    "start": "cd backend && npm run start",
    ```
    To:
    ```json
    "start": "cd backend && pnpm install && npm run start",
    ```
    Though it is unclear how necessary exactly this is.

## Major technologies used
* React w/ Material-UI  
    React and Material-UI were used as the foundation for the frontend. They provided simple state handling with and beatiful design framework. We exclusively used the functional component dialect of React components.
* React Router  
    React Router provided frontend route handling that took stress off of the backend and made navigation feel more fluid. React Router was used for all frontend routing (API routing and `POST` requests were of course handled by the backend).
* Monaco Editor  
    We chose the Monaco Editor (the same one that's used in VSCode) for our code editors. It was chosen over CodeMirror because it has excellent javascript support, which was our primary use case, and it also looks a lot nicer by default and a lot more in line with the visual design of our site.
* Express  
    Express was used to run the server and handle middleware.
* MongoDB  
    For data storage.
* Passport/`express-session`/`connect-mongodb-session`  
    All of these in conjunction were used to produce login sessions for users.
* `ws`  
    This was used to handle websockets, which were used for the group-forming and racing feature.
* `vm2`  
    VM2 was used for sandboxing code submissions so that malicious actors can't take down the server.

Other smaller technologies were used as well, such as `react-markdown`, `react-split-pane`, `nanoid`, `body-parser`, and `esm` (for Node 12 compatibility).

## Challenges
React and Material-UI were new technologies for some of the team members, which presented a challenge with implementing some features since there was a learning curve on top of an already tricky project (though not a challenge that couldn't be overcome). Figuring out how to pass state around in React was also quite a challenge, since while data can of course be passed through properties, that isn't always the best way to do it. In the end, React context providers were used to ease up key pain points, like with displaying dialog modals and passing around the `WebSocket` instance.

Figuring out how to integrate the code editors into the layout was also not easy. Having multiple Monaco instances on a page resulted in weird behavior that took a while to fix, and there was also the technical issue of implementing the visual experience, which required going through two different code editor libraries and two different draggable pane splitter libraries before finally settling on the layout in our website now.

Though VM2 does most of the heavy lifting when it comes to code sandboxing, designing how code was to be passed into VM2 to make challenge solution verification work properly was still a tricky task. We also had to be aware of certain vulnerabilities like `while(1);` and account for those, searching through the VM2 documentation for gaps like that and workarounds.

Client-server communication was a whole other beast, with trying to get asynchronous requests to work with React's state system. Sessions also required a few levels of iteration to finally get working properly. And WebSocket communication was tricky because we couldn't figure out how to get passport to tell `ws` about the authed user. This is actually why you don't have to be logged in to create/join a group.

Time was also a limitation. There were other stretch goals listed in our proposal that, while being listed as stretch goals, would've been nice to add. These are things like leaderboards, profile pages listing what challenges a user had completed or made, and other things to that effect. If we had more time, maybe we could've gotten one or two of those strech goals in there.

## Responsibilities
* Lindberg Simpson  
    Created the challenge listing page
* Stephen Lucas  
    Created the login/register page
* Yongcheng Liu  
    Implemented server-side sandboxing and the client-server protocol for requesting that code be run
* Trevor Paley  
    Overall project vision/design, implemented project infrastructure, created create/play challenge pages, and implemented most client-server communication (including RTC)

## Video
https://youtu.be/WpSViXvN9L0