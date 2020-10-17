const express = require("express"),
    session = require("express-session"),
    passport = require("passport"),
    cors = require("cors"),
    compression = require("compression"),
    GHStrategy = require("passport-github").Strategy,
    bodyParser = require("body-parser"),
    MongoClient = require("mongodb").MongoClient,
    mongodb = require("mongodb"),
    app = express(),
    port = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;
const MONG_CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

app.set("trust proxy", 1);

app.use(
    session({
        secret: process.env.APP_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(express.json());
app.use(express.static("public"));
app.use(compression());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(
    new GHStrategy({
            clientID: process.env.GIT_HUB_ID,
            clientSecret: process.env.GIT_HUB_SECRET,
            callbackURL: process.env.GIT_HUB_CALLBACK,
        },
        async(accToken, refreshToken, profile, cb) => {
            const client = new MongoClient(MONGO_URI, MONG_CONFIG);
            console.log(profile)
            await client.connect();
            const collection = client.db("t14-data").collection("users");

            const docs = await collection
                .find({ username: profile.username })
                .toArray();

            if (docs.length === 0) {
                await collection.insertMany([{
                    username: profile.username,
                }, ]);
            }

            const users = await collection
                .find({ username: profile.username })
                .toArray();

            await client.close();
            cb(null, users[0]);
        }
    )
);

app.get("/auth", passport.authenticate("github"));

app.get(
    "/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/");
    }
);

app.get("/settings", async(req, res) => {
    if (!req.user) {
        return res.json({ error: "User Not LoggedIn" })
    }

    const client = new MongoClient(MONGO_URI, MONG_CONFIG)

    await client.connect();
    const collection = client.db("t14-data").collection("settings");

    const docs = await collection.find({ user: req.user._id }).toArray();

    await client.close();

    return res.json(docs.length === 0 ? {} : {...docs[0], username: req.user.username });
});

app.post("/updatesettings", bodyParser.json(), async(req, res) => {
    if (!req.user) {
        return res.json({ error: "Needs Login" });
    }
    const newSettings = req.body;

    const client = new MongoClient(MONGO_URI, MONG_CONFIG);

    await client.connect();
    const collection = client.db("t14-data").collection("settings");

    const settings = await collection.find({ user: req.user._id }).toArray();

    if (settings.length === 0) {

        let ins = await collection.insertOne({
            backgroundColor: newSettings.backgroundColor,
            primaryColor: newSettings.primaryColor,
            accentColor: newSettings.accentColor,
            fontColor: newSettings.fontColor,
            user: req.user._id
        });

    } else {

        let up = await collection.updateOne({ user: req.user._id }, {
            $set: {
                backgroundColor: newSettings.backgroundColor,
                primaryColor: newSettings.primaryColor,
                accentColor: newSettings.accentColor,
                fontColor: newSettings.fontColor
            }
        })
    }


    const returnSettings = await collection.find({ user: req.user._id }).toArray();

    await client.close();

    return res.json({...returnSettings[0], username: req.user.username });
});


app.get("/data", async(req, res) => {
    if (!req.user) {
        return res.json({ error: "User Not LoggedIn" });
    }

    const client = new MongoClient(MONGO_URI, MONG_CONFIG);

    await client.connect();
    const collection = client.db("t14-data").collection("boxes");

    const docs = await collection.find({ user: req.user._id }).toArray();

    await client.close();

    return res.json(docs);
});


app.post("/add", bodyParser.json(), async(req, res) => {
    if (!req.user) {
        return res.json({ error: "User Not LoggedIn" });
    }
    const newItem = req.body;
    console.log('ID:' + newItem._id)
    newItem._id = new mongodb.ObjectID(newItem._id)
    console.log(newItem);

    const client = new MongoClient(MONGO_URI, MONG_CONFIG);

    await client.connect();
    const collection = client.db("t14-data").collection("boxes");

    await collection.insertOne({...newItem, user: req.user._id });

    const todos = await collection.find({ user: req.user._id }).toArray();
    await client.close();

    return res.json(todos);
});

app.post("/update", bodyParser.json(), async(req, res) => {
    if (!req.user) {
        return res.json({ error: "User Not LoggedIn" });
    }
    const newItem = req.body;

    const client = new MongoClient(MONGO_URI, MONG_CONFIG);

    await client.connect();
    const collection = client.db("t14-data").collection("boxes");

    let _id = newItem._id.length === 24 ? new mongodb.ObjectID(newItem._id) : newItem._id;

    let result = await collection.updateOne({ user: req.user._id, _id }, {
        $set: {
            title: newItem.title,
            posX: newItem.posX,
            posY: newItem.posY,
            type: newItem.type,
            items: newItem.items
        }
    })

    console.log(result.modifiedCount)

    const todos = await collection.find({ user: req.user._id }).toArray();
    await client.close();

    return res.json(todos);
})

app.post("/updateBoxPos", bodyParser.json(), async(req, res) => {
    if (!req.user) {
        return res.json({ error: "User Not LoggedIn" });
    }
    const newItem = req.body;

    if (!newItem.posX || !newItem.posY || !newItem._id) {
        return res.json({ error: "Must include id and coord positions" })
    }

    const client = new MongoClient(MONGO_URI, MONG_CONFIG);

    await client.connect();
    const collection = client.db("t14-data").collection("boxes");

    let _id = new mongodb.ObjectID(newItem._id)

    let result = await collection.updateOne({ user: req.user._id, _id }, {
        $set: {
            posX: newItem.posX,
            posY: newItem.posY,
        }
    })

    console.log(result.modifiedCount)

    const todos = await collection.find({ user: req.user._id }).toArray();
    await client.close();

    return res.json(todos);
})

app.delete("/remove", bodyParser.json(), async(req, res) => {
    if (!req.user) {
        return res.json({ error: "User Not LoggedIn" });
    }

    let _id = new mongodb.ObjectID(req.body._id);

    const client = new MongoClient(MONGO_URI, MONG_CONFIG);

    await client.connect();
    const collection = client.db("t14-data").collection("boxes");

    const { deletedCount } = await collection.deleteOne({
        _id,
        user: req.user._id,
    });

    const todos = await collection.find({ user: req.user._id }).toArray();
    await client.close();

    if (deletedCount >= 1) {
        return res.json(todos);
    }

    return res.json({});
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});