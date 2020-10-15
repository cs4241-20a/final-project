import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import passport from 'passport';
import path from 'path';
import { Strategy as LocalStrategy } from 'passport-local';
import { getCollection, mongoSessionStore } from './db.js';
import bodyParser from 'body-parser';
import { ObjectId } from 'mongodb';
import session from 'express-session';
import { loadEnv } from './util.js';
import { testCodeCompletesWithoutError } from './sandbox.js';
import { wsServer } from './ws.js';
import nanoid from 'nanoid';

loadEnv();

const PORT = 3000;

const app = express();

passport.use(new LocalStrategy(async (username, password, done) => {
    const users = await getCollection('users');
    const user = await users.findOne({username, password}, {projection: {
        _id: 0,
        username: 1
    }});
    if (user) {
        done(null, user);
    }
    else {
        done(null, false);
    }
}));

passport.use('local-signup', new LocalStrategy(async (username, password, done) => {
    const users = await getCollection('users');
    const user = await users.findOne({username});
    if (user) {
        done(null, false);
    }
    else {
        users.insertOne({username, password});
        done(null, {username});
    }
}));

passport.serializeUser((user, cb) => {
    cb(null, user.username);
});
  
passport.deserializeUser(async (id, cb) => {
    const users = await getCollection('users');
    cb(null, await users.findOne({username: id}, {projection: {
        _id: 0,
        username: 1
    }}));
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoSessionStore
}))

app.use(passport.initialize());
app.use(passport.session());

const authenticate = (req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ next) => {
    if (req.user) {
        return next();
    }
    res.status(401).send("You must be logged in to perform that action.");
};

app.get('/api/me', authenticate, async (req, res) => {
    res.json(req.user);
});

function fixChallenge(challenge) {
    const newChallenge = {...challenge};
    if (newChallenge.id == null) {
        newChallenge.id = newChallenge._id.toString();
    }
    delete newChallenge._id;
    return newChallenge;
}

app.get('/api/challenge/all', async (req, res) => {
    const challenges = await getCollection('challenges');
    /** @type {import('../frontend/js/types/challenge.js').ChallengeShort[]} */
    const shortChallenges = await challenges.find({}, {projection: {
        _id: 0,
        author: 1,
        title: 1
    }}).toArray();
    res.json(shortChallenges);
});

app.post('/api/challenge', authenticate, async (req, res) => {
    const { title, description, starterCode, solution, tests } = req.body;
    if ([typeof title, typeof description, typeof starterCode, typeof solution, typeof tests].every(x => x === 'string')) {
        const testResult = await testCodeCompletesWithoutError([solution, tests]);
        if (!testResult[0])  {
            return res.status(400).send("Your solution could not be verified. It may take too long to run, or it may not match your test code.");
        }
        /** @type {import('mongodb').Collection<import('../frontend/js/types/challenge').Challenge>} */
        const challenges = await getCollection('challenges');
        const result = await challenges.insertOne({
            author: req.user.username,
            title, description, starterCode, solution, tests
        });
        res.json(fixChallenge(result.ops[0]));
    }
    else {
        res.status(400).send("Invalid arguments to /api/challenge");
    }
});

app.get('/api/challenge/:id', async (req, res) => {
    /** @type {import('mongodb').Collection<import('../frontend/js/types/challenge').Challenge>} */
    const challenges = await getCollection('challenges');
    const challenge = await challenges.findOne({_id: new ObjectId(req.params.id)}, {projection: {
        _id: 1,
        author: 1,
        title: 1,
        description: 1,
        starterCode: 1
    }});
    if (!challenge) {
        return res.sendStatus(404);
    }
    res.json(fixChallenge(challenge));
});

app.post('/api/challenge/:id/solve', authenticate, async (req, res) => {
    const challenges = await getCollection('challenges');

    const solution = req.body.solution;

    const challenge = await challenges.findOne({_id: new ObjectId(req.params.id)}, {projection: { tests: 1 }});
    if (!challenge) {
        return res.status(400).send("A challenge with that id does not exist");
    }
    const challengeTests = challenge.tests;

    const testResult = await testCodeCompletesWithoutError([solution,challengeTests]);
    
    const responseData = {message: ""}
    if (testResult[0]) {
        const confirmationCode = nanoid(32);
        confirmChallengeCompletion(confirmationCode);
        responseData.message = "OK";
        responseData.code = confirmationCode;
    }
    else {
        console.log(testResult[2].code || testResult[2].name);
        switch (testResult[2].code || testResult[2].name) {
            case "ERR_SCRIPT_EXECUTION_TIMEOUT":
                responseData.message = "Timeout";
            default:
                responseData.message = testResult[2].code || testResult[2].name;
        }
    }
    req.json(responseData);
});

// Unknown API endpoint
app.use('/api/*', (req, res) => {
    res.sendStatus(404);
});

app.post('/register', passport.authenticate('local-signup', {failureRedirect: '/login?reason=register_fail'}), (req, res) => {
    res.redirect('/');
});

app.post('/login', passport.authenticate('local', {failureRedirect: '/login?reason=login_fail'}), (req, res) => {
    res.redirect('/');
});

app.post('/logout', authenticate, (req, res) => {
    req.logout();
    res.sendStatus(200);
});

// Serve files normally if we have them
app.use(expressStaticGzip("../dist", {
    enableBrotli: true,
    orderPreference: ['br']
}));

// Send the client otherwise
app.use('*', (req, res) => {
    res.sendFile(path.resolve("../dist/index.html.br"), {
        headers: {
            "Content-Encoding": "br",
            "Content-Type": "text/html; charset=UTF-8"
        }
    });
});

const server = app.listen(PORT, () => {
    console.log("Server started on http://localhost:" + PORT);
});

server.on('upgrade', (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, socket => {
        wsServer.emit('connection', socket, req);
    });
});