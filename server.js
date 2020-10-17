//this will be my server file!
const path = require("path");
const express = require("express");
const slash = require('express-slash');
const app = express(); // create express app
const cookieSession = require('cookie-session');
const GitHubStrategy = require('passport-github2').Strategy;
require('dotenv').config();


app.enable('strict routing');
app.use(slash());

const bodyParser = require('body-parser');

const passport = require('passport');
passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's GitHub profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the GitHub account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

function loginLimitedRoute(request, response) {
    let username = request.session['User'];
    if (username == null) {
        response.redirect('/login');
    } else {
        response.sendFile(__dirname + "/react-app/build/index.html");
    }
}

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const uri = `mongodb+srv://user:${process.env.DBPASSWORD}@cluster0.ajcp4.mongodb.net/<dbname>?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
let stories = null;
console.log("starting to connect...");
client.connect(err => {
    console.log("connected!");
    stories = client.db("data").collection("teststories");
    stories.find({}).toArray().then((res) => {
        console.log(res)
    })
    // stories.find({ }).toArray().then((res) => {console.log(res)})
});
let users = null;
client.connect(err => {
    users = client.db("data").collection("users");
    // users.find({ }).toArray().then((res) => {console.log(res)})
})


// add middlewares
// app.use(express.static(path.join(__dirname, "react-app", "build")));
// app.use(express.static("public"));


app.use(bodyParser.json())

function setSessionUser(req, username, password) {
    req.session['User'] = username;
    req.session['Pass'] = password;
}

app.get('/auth/github',
    passport.authenticate('github', {scope: ['user:email']}),
    function (req, res) {
    });

app.get('/auth/github/callback',
    passport.authenticate('github', {failureRedirect: '/login'}),
    function (req, res) {
        let username = req.user.username;
        let pass = req.user.id;
        let checkQuery = {'username': username, 'password': pass}
        users.find(checkQuery).toArray(function (err, result) {
            if (err) {
                throw err;
            }
            if (result.length === 1) {
                console.log('found and logging in ')
                console.log(username)
                console.log(pass)
                setSessionUser(req, username, pass);
                res.redirect('/');
            } else { //username password combo not found
                console.log('make a new user')
                users.insertOne({'username': username, 'password': pass}).then(setSessionUser(req, username, pass))
                res.redirect('/');
            }
        })
    });

app.post('/addstory', bodyParser.json(), (req, res) => {
    stories.countDocuments({}, (err, result) => {
        stories.insertOne({
            title: `Story ${result}`,
            listofwords: [req.body.storyfirstword],
            maxwords: req.body.storylength,
            finishedStory: false,
            votes: [],
            contributors: [req.body.author],
            timeStart: Date.now(),
            timeEnd: null,
            storyType: req.body.storyType,
            skip: req.body.skip
        }).then(r => {
            res.send(r.ops[0]);
        });
    });
})

app.get('/getcurstory', (req, res) => {
    stories.findOne({finishedStory: false}, (err, result) => {
        if (result == null) res.send({status: "nostory"});
        else res.send(result);
    })
})
//adds word to story
app.post('/addword', bodyParser.json(), (req, res) => {
    stories.updateOne({_id: mongodb.ObjectID(req.body.id)}, {
        $push: {listofwords: req.body.word},
        $set: {contributors: req.body.contributors}
    })
        .then(() => {
            stories.findOne({_id: mongodb.ObjectID(req.body.id)}, (err, result) => {
                const isFilled = result.listofwords.length >= result.maxwords;
                if (isFilled) {
                    stories.updateOne({_id: mongodb.ObjectID(req.body.id)}, {
                        $set: {
                            finishedStory: true,
                            timeEnd: Date.now()
                        }
                    })
                        .then(() => res.send({newword: req.body.word, isFilled}));
                } else {
                    res.send({newword: req.body.word, isFilled});
                }

            })
        })
})
//called when author wishes to edit story title
app.post('/edittitle', bodyParser.json(), (req, res) => {
    stories.updateOne({_id: mongodb.ObjectID(req.body._id)}, {$set: {title: req.body.title}})
        .then(() => {
            res.send({status: 'success!'});
        })
})


//called when the user enters the finished stories page
app.get('/getfinishedstories', (req, res) => {
    stories.find({"finishedStory": true}).toArray((err, results) => {
        res.send(results);
    });
})

app.get('/getallcompleted', (req, res) => {
    stories.find({finishedStory: true}).toArray(function (err, result) {
        res.json({stories: result});
    });
})

app.post('/getbyID', bodyParser.json(), (req, res) => {
    stories.find({_id: mongodb.ObjectId(req.body._id), finishedStory: true}).toArray(function (err, result) {
        res.json({story: result[0]});
    });
})

app.post('/changeVote', bodyParser.json(), (req, response) => {
    stories.updateOne({_id: mongodb.ObjectId(req.body._id)}, {$set: {votes: req.body.votes}}, {upsert: false}, (err, res) => response.send(res));
})

app.get('/', (request, response) => {
    loginLimitedRoute(request, response)
})


app.post('/login', (request, response) => {
    let username = request.body.username;
    let pass = request.body.password;
    let checkQuery = {'username': username, 'password': pass}
    users.find(checkQuery).toArray(function (err, result) {
        if (err) {
            throw err;
        }
        if (result.length === 1) {
            console.log('found and logging in ')
            console.log(username)
            console.log(pass)
            setSessionUser(request, username, pass);
            response.redirect('/');
        } else { //username password combo not found
            let userExistsQuery = {'username': username};
            users.find(userExistsQuery).toArray(function (err, result) {
                if (err) {
                    throw err;
                }
                if (result.length === 1) { //found a username
                    response.json({error: 'password'})
                } else {//couldnt find username
                    response.json({error: 'username'})
                }
            })
        }
    })
});

app.post('/register', (request, response) => {
    let username = request.body.username;
    let pass = request.body.password;
    let checkQuery = {'username': username}
    users.find(checkQuery).toArray(function (err, result) {
        if (err) {
            throw err;
        }
        if (result.length === 1) {
            response.json({code: 'found'})
        } else {
            users.insertOne({'username': username, 'password': pass})
                .then(setSessionUser(request, username, pass))
                .then(() => response.json({code: 'made'}));
        }
    })
})

app.post('/logOut', (request, response) => {
    setSessionUser(request, null, null)
    response.sendStatus(200)
})


app.get("/login", (request, response) => {
    response.sendFile(__dirname + "/react-app/build/index.html");
});
app.get('/currentUser', (request, response) => {
    console.log(`user to return in currentuser: ${request.session['User']}`)
    response.json({user: request.session['User'] == undefined ? null : request.session['User']})
});
app.get("/register", (request, response) => {
    response.sendFile(__dirname + "/react-app/build/index.html");
});
app.get("/completedStories", (request, response) => {
    response.sendFile(__dirname + "/react-app/build/index.html");
});
app.get("/CreateStory", (request, response) => {
    loginLimitedRoute(request, response)
});

app.get("/completeStory", (request, response) => {
    // response.json({request.body.id})
    response.sendFile(__dirname + "/react-app/build/index.html");
});

app.get("/contribute", (request, response) => {
    loginLimitedRoute(request, response)
});


// gets everything else
// app.get('*', (req, res)=>{
//   res.status(200).sendFile(path.join(__dirname, "react-app", "build", "index.html"))
// })

app.use(express.static("react-app/build"));

// start express server on port 3000
app.listen(3000, () => {
    console.log("server started on port 3000");
});