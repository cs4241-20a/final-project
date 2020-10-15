const express = require("express");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const path = require("path");
const Ably = require("ably");
const GitHubStrategy = require("passport-github").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const DeviantStrategy = require("passport-deviantart").Strategy;
const app = express();
const compression = require("compression");
const morgan = require("morgan");
const MongoClient = require("mongodb").MongoClient;
const mongo = require("mongodb");
const database = "finalproj";

app.use(require("cors")());

require("dotenv").config();

const LiveRest = new Ably.Rest(process.env.ABLY_KEY);

const mongoURI = process.env.MONGO_URL;
const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: process.env.SECRET || "testdevlol",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));
app.use(compression());
app.use(morgan("combined"));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  next();
});

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK,
    },
    async (accessToken, refreshToken, profile, cb) => {
      const client = new MongoClient(mongoURI, mongoConfig);

      await client.connect();
      const collection = client.db(database).collection("users");

      const docs = await collection
        .find({ username: profile.username, strategy: "GitHub" })
        .toArray();

      const user = {
        username: profile.username,
        password: null,
        strategy: "GitHub",
      };

      if (docs.length == 0) {
        await collection.insertMany([user]);
      }

      const users = await collection
        .find({ username: profile.username, strategy: "GitHub" })
        .toArray();

      await client.close();
      cb(null, users[0]);
    }
  )
);

passport.use(
  new DeviantStrategy(
    {
      clientID: process.env.DEVIANTART_ID,
      clientSecret: process.env.DEVIANTART_SECRET,
      callbackURL: process.env.DEVIANTART_CALLBACK,
    },
    async (accessToken, refreshToken, profile, cb) => {
      const client = new MongoClient(mongoURI, mongoConfig);

      await client.connect();
      const collection = client.db(database).collection("users");

      const docs = await collection
        .find({ username: profile.username, strategy: "DeviantArt" })
        .toArray();

      const user = {
        username: profile.username,
        password: null,
        strategy: "DeviantArt",
      };

      if (docs.length == 0) {
        await collection.insertMany([user]);
      }

      const users = await collection
        .find({ username: profile.username, strategy: "DeviantArt" })
        .toArray();

      await client.close();
      cb(null, users[0]);
    }
  )
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const client = new MongoClient(mongoURI, mongoConfig);

    await client.connect();
    const collection = client.db(database).collection("users");

    const docs = await collection
      .find({ username, strategy: "Local" })
      .toArray();

    if (docs.length == 0) {
      bcrypt.genSalt(10, async (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
          const user = {
            username,
            password: hash,
            strategy: "Local",
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

app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/callback/github",
  passport.authenticate("github", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get("/auth/deviantart", passport.authenticate("deviantart"));

app.get(
  "/callback/deviantart",
  passport.authenticate("deviantart", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("/");
  }
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

async function getLeaderboards() {
  const client = new MongoClient(mongoURI, mongoConfig);

  await client.connect();

  const users = client.db(database).collection("users");
  const cheems = client.db(database).collection("cheems");

  let userLeaderboards = await users.find({}).toArray();
  userLeaderboards = userLeaderboards.map((u) => {
    return {
      id: u._id,
      username: u.username,
      messagesSent: u.messagesSent,
    };
  });

  const cheemLeaderboards = await cheems.find({}).toArray();

  // perform actions on the collection object
  await client.close();

  return { userLeaderboards, cheemLeaderboards };
}

app.post("/api/submit", async (req, res) => {
  if (!req.user) {
    return res.json({ success: false, needsAuth: true });
  }

  if (!req.body.message) {
    return res.json({ success: false, error: "needsmsg" });
  }

  if (!req.body.cheemId) {
    return res.json({ success: false, error: "needscheem" });
  }

  const object = req.body;

  object.user = req.user._id;
  object.username = req.user.username;
  object.ts = new Date().getTime();

  if (req.headers["x-forwarded-for"]) {
    object.ip = req.headers["x-forwarded-for"].split(",")[0];
  } else {
    object.ip = "N/A";
  }

  const client = new MongoClient(mongoURI, mongoConfig);

  await client.connect();

  const cheems = client.db(database).collection("cheems");

  let selectedCheem = await cheems
    .find({ _id: new mongo.ObjectID(object.cheemId) })
    .toArray();
  selectedCheem = selectedCheem[0];

  if (!selectedCheem)
    return res.json({ success: false, error: "invalidcheem" });

  object.cheemURL = selectedCheem.url;

  const chats = client.db(database).collection("chats");
  await chats.insertMany([object]);

  const users = client.db(database).collection("users");
  await users.updateOne(
    { _id: new mongo.ObjectID(object.user) },
    { $inc: { messagesSent: 1 } }
  );

  await cheems.updateOne(
    { _id: new mongo.ObjectID(object.cheemId) },
    { $inc: { usages: 1 } }
  );

  const channel = LiveRest.channels.get("master");
  channel.publish("message", object);

  await client.close();

  const response = await getLeaderboards();
  channel.publish("leaderboards", response);
  return res.json({});
});

app.get("/api/getData", async (req, res) => {
  if (!req.user) {
    return res.send("NEEDS LOGIN");
  }

  const client = new MongoClient(mongoURI, mongoConfig);

  await client.connect();

  let chats = client.db(database).collection("chats");
  chats = await chats.find({}).toArray();

  let cheems = client.db(database).collection("cheems");
  cheems = await cheems.find({}).toArray();

  // perform actions on the collection object
  await client.close();

  const response = await getLeaderboards();

  return res.json({
    chats,
    cheems,
    ...response,
  });
});

app.get("/api/submitCheem", async (req, res) => {
  if (req.query.password != process.env.CHEEM_PASSWORD || !req.query.url) {
    return res.send(
      "<h1>No.</h1><img src='https://i.pinimg.com/736x/76/83/11/7683113f776316042147d0996432b97c.jpg'/>"
    );
  }

  const client = new MongoClient(mongoURI, mongoConfig);
  await client.connect();
  const cheems = client.db(database).collection("cheems");
  await cheems.insertMany([
    {
      url: req.query.url,
    },
  ]);

  await client.close();

  return res.send(
    "<h1>Success</h1><img src='https://ih1.redbubble.net/image.1035189273.5117/st,small,507x507-pad,600x600,f8f8f8.jpg' />"
  );
});

app.post("/api/uploadCheem", async (req, res) => {
  const client = new MongoClient(mongoURI, mongoConfig);
  await client.connect();
  const cheems = client.db(database).collection("cheems");

  await cheems.insertMany([
    {
      url: req.body.uploadURL,
    },
  ]);

  await client.close();
  return res.sendStatus(200)
});

app.get("/api/getUser", async (req, res) => {
  if (req.user) delete req.user.password;
  return res.json(req.user || {});
});

app.get("/", (_, response) => {
  response.sendFile(__dirname + "/build/index.html");
});

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
