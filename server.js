const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const body_parser = require('body-parser');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const app = express();

const DB_SERVER = process.env.DB_SERVER;
const DB_NAME = process.env.DB_NAME;

mongoose.connect(`mongodb://${DB_SERVER}/${DB_NAME}`)
    .then(() => console.log('MongoDB Connection Successful'));

const score_schema = new mongoose.Schema({
    user_id: {type: String},
    game: String,
    name: String,
    scores: [Number],
    max_score: Number,
});

const score_model = mongoose.model('Score', score_schema);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'https://todo.zhdev.app/auth/github/callback'
}, (access, refresh, profile, done) => {
    score_model.findOneAndUpdate({user_id: profile.id, game: 'minesweeper'}, {
        $setOnInsert: {
            name: profile.username,
            scores: [],
            max_score: 0,
        }
    }, {upsert: true}).then(() => done(null, profile));
    score_model.findOneAndUpdate({user_id: profile.id, game: 'snake'}, {
        $setOnInsert: {
            name: profile.username,
            scores: [],
            max_score: 0,
        }
    }, {upsert: true}).then(() => done(null, profile));
    score_model.findOneAndUpdate({user_id: profile.id, game: '2048'}, {
        $setOnInsert: {
            name: profile.username,
            scores: [],
            max_score: 0,
        }
    }, {upsert: true}).then(() => done(null, profile));
}));

app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(session({secret: 'final', resave: false, saveUnitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

app.get('/login', (req, res) => {
    res.render('login', {user: req.user});
});

app.get('/auth/github', passport.authenticate('github', {scope: ['user:email']}));

app.get('/auth/github/callback',
    passport.authenticate('github', {failureRedirect: '/'}), (req, res) => {
        res.redirect('/');
    });

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/app');
        return;
    }

    res.render('index', {user: req.user});
});

app.get('/app', ensureAuthenticated, (req, res) => {
    res.render('app', {user: req.user});
});

app.get('/api/:game/all_scores', (req, res) => {
    let out = [];
    score_model.find({game: req.params.game}).sort('max_score', -1).limit(10).execFind(
        (error, entries) => {
            for (let entry in entries) {
                out.push({
                    player_name: entry.name,
                    value: entry.max_score,
                });
            }
        }
    );

    res.send(JSON.stringify(out));
});

app.get('/api/:game/score', (req, res) => {
    score_model.findOne({
        user_id: req.user.id,
        game: req.params.game,
    }).then(doc => {
        res.send(doc.max_score);
    });
});

app.get('/api/:game/play_count', (req, res) => {
    score_model.findOne({
        user_id: req.user.id,
        game: req.params.game,
    }).then(doc => {
        res.send(doc.scores.length);
    });
});

app.post('/api/:game/score', body_parser.text, (req, res) => {
    let body = parseInt(req.body);

    score_model.findOne({
        user_id: req.user.id,
        game: req.params.game,
    }).then(doc => {
        doc.scores.push(body);
        doc.max_score = Math.max(...(doc.scores));
        doc.markModified('scores');
        doc.markModified('max_score');
        doc.save();
    });

    res.end();
});

const listener = app.listen(process.env.PORT, () => {
    console.log("Listening Started " + listener.address().port);
});
