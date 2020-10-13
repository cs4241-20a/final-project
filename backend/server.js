import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import passport from 'passport';
import path from 'path';
import { Strategy as LocalStrategy } from 'passport-local';
import { getCollection } from './db.js';
import bodyParser from 'body-parser';

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
    const user = await users.findOne({username, password}, {projection: {
        _id: 0,
        username: 1
    }});
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
    cb(null, await users.findOne({id}, {projection: {
        _id: 0,
        username: 1
    }}));
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

const authenticate = (req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ next) => {
    if (req.user) {
        return next();
    }
    res.status(401).send("You must be logged in to perform that action.");
};

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
        /** @type {import('mongodb').Collection<import('../frontend/js/types/challenge').Challenge>} */
        const challenges = await getCollection('challenges');
        const result = await challenges.insertOne({
            author: req.user.username,
            title, description, starterCode, solution, tests
        });
        const newChallenge = result.ops[0];
        newChallenge.id = newChallenge._id;
        delete newChallenge._id;
        res.json(newChallenge);
    }
    else {
        res.status(400).send("Invalid arguments to /api/challenge");
    }
});

// Unknown API endpoint
app.use('/api/*', (req, res) => {
    res.sendStatus(404);
});

app.post('/register', passport.authenticate('local-signup', {failureRedirect: '/register'}), (req, res) => {
    res.redirect('/');
});

app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
    res.redirect('/');
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

app.listen(PORT, () => {
    console.log("Server started on http://localhost:" + PORT);
});