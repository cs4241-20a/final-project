const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
app.use(express.json()); // body-parser
const server = http.createServer(app); // required for socket io
const io = socketIO(server);

io.on("connection", (client) => {
    console.log("New client connected", client.id);

    client.on("join", (roomID) => {
        console.log(client.id, "joined", roomID);
        client.join(roomID);
        io.sockets.in(roomID).emit("chat", "new user joinded");
    });

    client.on("chat", (msg) => {
        io.sockets.in(msg.roomID).emit("chat", msg.message);
    });

    client.on("disconnect", () => {
        console.log("Client disconnected", client.id);
    });
});

// app.use(express.static("public"));
app.get("/chatroom/:roomID", (req, res) => {
    res.sendFile(__dirname + "/public/chatroom.html");
});
app.get("/chatroom/:roomID", (req, res) => {
    res.sendFile(__dirname + "/public/chatroom.html");
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

app.use(express.static("public", { extensions: "html" }));

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server started on port ${port}`));
