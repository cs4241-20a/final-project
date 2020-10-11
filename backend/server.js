import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import passport from 'passport';
import path from 'path';
import { Strategy as LocalStrategy } from 'passport-local';
import { getCollection } from './db.js';

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