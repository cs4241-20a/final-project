require('dotenv').config();
const express = require('express');

const app = express();
const passport = require("passport");
const bcrypt = require("bcrypt");
const session = require("express-session");
const compression = require("compression");
const morgan = require("morgan");
const MongoClient = require("mongodb").MongoClient;
const LocalStrategy = require("passport-local").Strategy;
const port = 5000;

const uri = process.env.FP_URI;
const mongoSetup = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
};

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: process.env.FP_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
); 
app.use(express.json());
app.use(express.static("public"));
app.use(compression());
app.use(morgan("combined"));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	//console.log(req.body);
	next();
});

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});

passport.use(
	new LocalStrategy(async (username, password, done) => {
		const client = new MongoClient(uri, mongoSetup);

		await client.connect();
		const collection = client.db("fp-database").collection("users");

		const docs = await collection.find({ username, github: false }).toArray();

		if (docs.length == 0) {
			bcrypt.genSalt(10, async (err, salt) => {
				bcrypt.hash(password, salt, async (err, hash) => {
					const user = {
						username,
						password: hash,
						github: false,
					};
					await collection.insertMany([user]);
					await client.close();
					done(null, user);
				});
			});
		} else {
			await client.close();
			bcrypt.compare(password, docs[0].password, function (err, result) {
				if (result) {
					done(null, docs[0]);
				} else {
					done(null, false);
				}
			});
		}
	})
);

app.post("/login", passport.authenticate("local"), function (req, res) {
	req.login(req.user, () => {
		delete req.user.password;
		return res.json(req.user);
	});
});

app.get("/logout", function (req, res) {
	req.logout();
	return res.send();
});

app.post("/submit", async (req, res) => {
	if (!req.user) {
		return res.json({ success: false, needsAuth: true });
	}

	const object = req.body;
	object.user = req.user._id;

	if (req.headers["x-forwarded-for"]) {
		object.ip = req.headers["x-forwarded-for"].split(",")[0];
	} else {
		object.ip = "N/A";
	}

	const client = new MongoClient(uri, mongoSetup);
	await client.connect();
	const collection = client.db("fp-database").collection("leaderboard");

	if (object.delete) {
		await collection.deleteOne({ _id: new mongo.ObjectID(object.id) });
	} else if (object.id) {
		await collection.updateOne(
			{ _id: new mongo.ObjectID(object.id) },
			{ $set: { ...object, _id: new mongo.ObjectID(object.id) } }
		);
	} else {
		await collection.insertMany([object]);
	}

	const docs = await collection.find({ user: req.user._id }).toArray();
	await client.close();
	return res.json(docs);
});

app.get("/api/getData", async (req, res) => {
	if (!req.user) {
		return res.send("LOGIN REQUIRED");
	}

	const client = new MongoClient(uri, mongoSetup);

	//alter collection objects
	await client.connect();
	const collection = client.db("fp-database").collection("leaderboard");

	const docs = await collection.find({ user: req.user._id }).toArray();

	//alter collection objects
	await client.close();
	return res.json(docs);
});

app.get("/api/getUser", async (req, res) => {
	if (req.user) delete req.user.password;
	return res.json(req.user || {});
});

app.get("/", (_, response) => {
	response.sendFile(__dirname + "/public/index.html");
});

const listener = app.listen(process.env.PORT || port, () => {
	console.log("Your app is listening on port " + listener.address().port);
});
