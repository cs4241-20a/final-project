const md5 = require('md5');
const sanitize = require('mongo-sanitize');

const User = require('../models').User;

function auth(req, res, next) {
    User.findOne({'_id': sanitize(req.session.userId), 'password': sanitize(req.session.password)}, function (err, result) {
        if (result != null) {
            next();
        } else {
            req.session.userId = '';
            req.session.password = '';
            res.json({ code: 401, msg: 'Unauthorized' });
        }
    });
}

function isAuthenticated(req, res) {
    User.findOne({'_id': sanitize(req.session.userId), 'password': sanitize(req.session.password)}, function (err, result) {
        if (result != null) {
            res.json({code: 200, user: result.username});
        } else {
            res.json({code: 401});
        }
    });
}

function login(req, res) {
    const user = req.body;

    if (!user.username || !user.password) {
        res.json({ code: 401, msg: 'Empty fields.'});
    } else {
        User.findOne({username: sanitize(user.username), password: md5(user.password)}, function(err, result) {
            if (result != null) {
                req.session.userId = result._id;
                req.session.password = result.password;

                res.json({ code: 201, msg: '' });
            } else {
                res.json({ code: 401, msg: 'Incorrect username or password.'});
            }
        });
    }

}

function reg(req, res) {
    if (req.body.username === "" || req.body.password === "") {
        res.json( {code: 400, msg: 'Empty fields.'} );
    } else {
        User.findOne({username: sanitize(req.body.username)}, function(err, result) {
            if (result != null) {
                res.send( {code: 400, msg:'The username is already taken. Try another.'} );
            } else {
                let user = {};
                user.username = sanitize(req.body.username);
                user.password = md5(req.body.password);

                let newUser = new User(user);
                newUser.save(function (err, docs) {
                    req.session.userId = docs._id;
                    req.session.password = docs.password;

                    res.send({ code: 201, msg:'' });
                });
            }
        });
    }
}

function logout(req, res) {
    req.session.userId = '';
    req.session.password = '';

    res.send({ code: 200, msg: '' });
}

module.exports = {
    login: login,
    reg: reg,
    logout: logout,
    auth: auth,
    isAuthenticated: isAuthenticated
};
