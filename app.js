const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { body } = require('express-validator');
const config = require('./config');

const app = new express();

app.disable('x-powered-by');
app.set('trust proxy', 1);


app.use(express.static('views'));
app.use(express.static('public'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(cookieParser());

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || config.session.secret,
    name: 'sessionId',
    cookie: {
        httpOnly: true,
        expires: new Date(Date.now() + 3600000 * 24 * 30)
    }
}));

mongoose.connect(process.env.MONGODB_URL || config.db.url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const conn = mongoose.connection;
conn.on('connected', function () {
    console.log('Mongodb connected');
});


// routes

const user = require('./routes/user');
const dataset = require('./routes/dataset')

// api


app.post('/api/import', user.auth, dataset.importMultiline);
app.get('/api/fetch', user.auth, dataset.getAllNeedRemembered);
app.get('/api/fetchAll', user.auth, dataset.getAll);
app.post('/api/delBatch', user.auth, dataset.batchDel);
app.post('/api/mark', user.auth, dataset.markEntries);
app.post('/api/search', user.auth, dataset.search);

app.post('/api/login', user.login);
app.get('/api/logout', user.logout);
app.get('/api/isAuth', user.isAuthenticated);
app.post('/api/reg', body('username').trim().escape(), user.reg);


app.get('/', (req, res) => {
    res.sendFile(path.resolve('client', 'build', 'views/index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/views/login.html");
});
app.get('/register', (req, res) => {
    res.sendFile(__dirname + "/views/register.html");
});

app.get('/styles.css', (req, res) => {
  res.sendFile(__dirname + "/public/style.css");
})

app.get('/adder.js', (req, res) => {
  res.sendFile(__dirname + "/public/adder.js");
})


if (!module.parent) {
    app.listen(process.env.PORT || 3000, () => {
        console.log('Started on port 3000 or specified');
    });
}

module.exports = app;
