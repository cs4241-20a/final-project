// @author: Luke Bodwell
"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const compression = require("compression");
const methodOverride = require("method-override");
const helmet = require("helmet");
const session = require("express-session");

const apiRouter = require("./routes/api/api-router");
const githubAuth = require("./routes/auth/github-auth");

const app = express();

const server = http.createServer(app);
const io = socketio(server);
//? Why did I do this?
//TODO: Look into why this is accessed from a module export instead of required separately
const {passport, ensureAuthenticated} = githubAuth;


dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV;
const MONGO_URI = process.env.MONGO_URI;

githubAuth.setupPassport();

// Connect to database
try {
	mongoose.connect(MONGO_URI, {
		useNewUrlParser: true, 
		useUnifiedTopology: true
	}).then(() => console.log("Connected to db"));
} catch (err) {
	console.error(err);
}

// Enable logging middleware based on environment
if (NODE_ENV === "development") {
	app.use(morgan("dev"));
} else if (NODE_ENV === "production") {
	app.use(morgan("common", {
		skip: (req, res) => res.statusCode < 400,
		stream: fs.createWriteStream(path.join(__dirname, "access.log"), {flags: "a"})
	}));
}

// Middleware processing
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(methodOverride());
app.use(session({
	secret: "itsasecret",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

// Routing
app.use("/api", apiRouter.router);
app.use("/auth/github", githubAuth.router);

app.get("/", ensureAuthenticated, (req, res) => {
	res.sendFile(path.join(__dirname, "public/home.html"));
});
app.get("/tasks", ensureAuthenticated, (req, res) => {
	res.sendFile(path.join(__dirname, "public/tasks.html"));
});
app.get("/login", (req, res) => {
	res.sendFile(path.join(__dirname, "public/login.html"));
});
app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/login");
});

app.get("*", (req, res) => {
	res.status(404).send("Error 404. Not found.");
});


// Web socket handling
io.on("connection", socket => {
	console.log("A user has connected");
	socket.broadcast.emit("message", "A user has connected");
	socket.emit("message", "Hello user!");
	socket.on("disconnect", () => {
		console.log("A user has disconnected");
		io.emit("message", "A user has disconnected");
	});
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));