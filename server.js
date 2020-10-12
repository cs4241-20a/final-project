const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const fetch = require("node-fetch");
const cookieSession = require("cookie-session");
const { request, response } = require("express");
const dotenv = require("dotenv").config(); //is this necessary?

const app = express();
app.use(express.json()); // body-parser
app.use( cookieSession({
    name: 'Pictocookies',
    keys: ['key1'],
    secret: process.env.COOKIE_SECRET
}));
const server = http.createServer(app); // required for socket io
const io = socketIO(server);

io.on("connection", (client) => {
    console.log("New client connected", client.id);

    client.on("join", (roomID) => {
        console.log(client.id, "joined", roomID);
        client.join(roomID);
        io.sockets.in(roomID).emit("chat", "New User Joined");
    });

    client.on("chat", (msg) => {
        io.sockets.in(msg.roomID).emit("chat", msg.message);
    });

    client.on("disconnect", () => {
        console.log("Client disconnected", client.id);
    });
});

//GITHUB LOGIN STUFF
app.get('/getghurl', (req, res) => {
    const path = req.protocol + '://' + req.get('host');
    const ghid = process.env.GHID;
    const url = `https://github.com/login/oauth/authorize?client_id=${ghid}&redirect_uri=${path}/login/github/callback`;
    res.json(url);
})

async function getGHAccessToken(code, ghid, ghsecret) {
    const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
        client_id: ghid,
        client_secret: ghsecret,
        code
        })
    })
    .then( response => {
        //console.log(response)
        response = response.text();
        return response;
    } );

    const params = new URLSearchParams(response);
    return params.get('access_token');
}

async function getGHUser(accessToken) {
    const ghdata = await fetch('https://api.github.com/user', {
        headers: { Authorization: `bearer ${accessToken}`}
    })
    .then (ghdata => ghdata.json() );

    return ghdata;
}

app.get('/login/github/callback', async (req, res) => {
    const code = req.query.code;
    const ghid = process.env.GHID;
    const ghsecret = process.env.GHSECRET;

    const accessToken = await getGHAccessToken(code, ghid, ghsecret);
    const ghdata = await getGHUser(accessToken);
    
    //console.log(ghdata);
    if(ghdata) {
        req.session.username = ghdata.login;
        //console.log(req.session.username);
        res.redirect("/");
    } else {
        console.log('Login failed');
        res.redirect("/login.html");
    }
});

app.post("/logout", (req, res) => {
    req.session = null;
    res.clearCookie();
    res.redirect('/login.html');
});

app.use(express.static("public", { extensions: "html" }));

app.get("/", (req, res) => {
    //console.log(req.session.username);
    if(req.session.username) {
        res.sendFile(__dirname + "/public/nav.html");
    } else {
        res.redirect("/login.html");
    }
});
app.get("/nav.html", (req, res) => {
    if(req.session.username) {
        res.sendFile(__dirname + "/public/nav.html");
    } else {
        res.redirect("/login.html");
    }
});

app.get("/chatroom/:roomID", (req, res) => {
    if(req.session.username) {
        res.sendFile(__dirname + "/public/chatroom.html");
    } else {
        res.redirect("/login.html");
    }
});

app.get("/chatroom/js/paper-full.js", (req, res) => {
    res.sendFile(__dirname + "/public/js/paper-full.js");
});

app.get("/chatroom/js/script.js", (req, res) => {
    res.sendFile(__dirname + "/public/js/script.js");
});

app.get("/chatroom/css/style.css", (req, res) => {
    res.sendFile(__dirname + "/public/css/style.css");
});

app.get("/chatroom/js/draw.js", (req, res) => {
    res.sendFile(__dirname + "/public/js/draw.js");
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server started on port ${port}`));
