const express = require('express')
const exphbs = require('express-handlebars')
const {MongoClient} = require('mongodb');
const passport = require("passport");
const GitHubStrategy = require('passport-github').Strategy
const cookieSession = require('cookie-session')
//require('dotenv').config()
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const http = require("http");
const ws = require("ws");
const IPinfo = require("node-ipinfo");


const PORT = 3000
const app = express()
const server = http.createServer( app )

let date = new Date()
let formattedDate = date.toLocaleDateString('en-US')


/////////////////////////////// General Middleware  ///////////////////////////////

// serve favicon
app.use(favicon(__dirname + "/public/images/favicon.ico"));

// set template rendering engine to use handlebars
app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')


// server static files from dir 'public'
app.use(express.static('public'))


////////////////////////////////// OAuth things //////////////////////////////////
passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async function(accessToken, refreshToken, profile, cb) {
        return cb(null, profile)
    }
))

passport.serializeUser((user, done)=> {
    done(null, user.username)       // put username in cookie
})

passport.deserializeUser((username, done)=> {
    done(null, getUser(username))   // attach user property to request object
})

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 10000,   // login cookies expire after one day
    keys: [process.env.COOKIE_KEY]  // encrypt cookie based on env variable: COOKIEKEY
}))

app.use(passport.initialize())
app.use(passport.session())


////////////////////////////////// Routes //////////////////////////////////


// ================ GET ================

// home route
app.get('/', (req, res) => {
    if (req.user !== undefined && req.user !== null) { // if user has logged in
        req.user.then(user => {

            // send user data back
            res.sendFile(__dirname + "/views/index.html");
        })
    }
    else {
        res.sendFile(__dirname + "/views/login.html");
    }
})

// in case index.html specified
app.get("/index.html", (req, res) => {
    if (req.user !== undefined && req.user !== null) { // if user has logged in
        req.user.then(user => {

            // send user data back
            res.sendFile(__dirname + "/views/index.html");
        })
    }
    else {
        res.sendFile(__dirname + "/views/login.html");
    }
})

app.get("/gallery.html", (req, res) => {
    res.sendFile(__dirname + "/views/gallery.html");
})

app.get('/mydata', (req, res) => {
    if (req.user !== undefined && req.user !== null) { // if user has logged in
        req.user.then(user => {

            // send user data back
            res.json(user)
        })
    }
})

app.get("/inbox", (req, res) => {
    if (req.user !== undefined && req.user !== null) { // if user has logged in
        req.user.then(user => {


            // send user's inbox back
            getInbox(user.username).then(drawings => {

                let drawingArray = []
                drawings.forEach(drawing=>{
                    drawingArray.push(drawing)
                }).then(()=>{
                    // send drawing data back
                    res.json(drawingArray)
                })
            })
        })
    }
})

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
    passport.authenticate('github', {failureRedirect: '/'}),
    function (req, res) {
        getUser(req.user.username).then(result => {
            if (result === null) {
                //get country code for flag
                ipToFlagPath(req).then((flagPath) => {
                    // Create new entry in DB
                    upsertUser({
                        username: req.user.username,
                        avatar: '/images/placeholder_avatar.png',      // Some placeholder image here (maybe github icon?)
                        flag: flagPath,
                        friends: ["noahvolson", "csmbrad", "excitinglyplain", "carlypereira"]
                    }).then(res.redirect('/'))
                })
            } else { // User found
                res.redirect('/')
            }
        })
    })


app.get("/logout", (req, res) => {
    if (req.user !== undefined) {
        req.logOut();
    }
    res.redirect('/');
})

// ================ POST ================

app.post('/friend', bodyParser.json(),  (req, res) => {
    getUser(req.body.friendUsername).then(friendData => {
        // send friend data back
        res.json(friendData)
    })
})

app.post('/drawings', bodyParser.json(),  (req, res) => {

    req.user.then(user => {
        getConversation(req.body.artist, user.username).then(drawings => {

            let drawingArray = []
            drawings.forEach(drawing=>{
                drawingArray.push(drawing)
            }).then(()=>{
                // send drawing data back
                res.json(drawingArray)
            })
        })
    })
})


app.post('/uploadDrawing', bodyParser.json(), (req, res)=> {

        insertDrawing(req.body).then(()=>{
           console.log(`Added ${req.body}`)
       })
    }
)

app.post('/send', bodyParser.json(), (req, res) => {
    console.log(req.body)
})

app.post('/pfp', bodyParser.json(),  (req, res) => {
    //console.log(req)
    if (req.user !== undefined && req.user !== null) { // if user has logged in

        req.user.then(user => {
            let updatedUser = {
                username: user.username,
                avatar: req.body.avatar,      // Some placeholder image here (maybe github icon?)
                flag: user.flag,   // Grab flag from IP???
                friends: user.friends
            }
            console.log(updatedUser)
            upsertUser(updatedUser)
                .then(res.json(updatedUser))
        })
    }
})

// start listening on PORT
app.listen(PORT, () => {
    console.log(`App listening on port: ${PORT}`)
})
server.listen(2000, () =>{
    console.log(`server listening on port: 2000`);
})


////////////////////////////////// Database things //////////////////////////////////
let DBclient = null;

async function initConnection() {
    const uri = `mongodb+srv://PixelTalk:${process.env.PASSWORD}@cluster0.aaowb.mongodb.net/<dbname>?retryWrites=true&w=majority`
    DBclient = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true })
    await DBclient.connect()
}

async function getUser(username) {
    if (DBclient === null) {await initConnection()}
    let collection = DBclient.db("WebwareFinal").collection("UserData")
    return await collection.findOne({username: username})
}

async function getConversation(artist, receiver) {
    if (DBclient === null) {await initConnection()}
    let collection = DBclient.db("WebwareFinal").collection("Drawings")
    return await collection.find({artist: artist, receiver:receiver})
}

async function getInbox(receiver) {
    if (DBclient === null) {await initConnection()}
    let collection = DBclient.db("WebwareFinal").collection("Drawings")
    return await collection.find({receiver:receiver})
}

async function upsertUser(userData) {
    if (DBclient === null) {await initConnection()}
    let collection = DBclient.db("WebwareFinal").collection("UserData")
    collection.updateOne(
        { username: userData.username },
        { $set: userData },
        { upsert: true });
}

async function insertDrawing(drawing) {
    if (DBclient === null) {await initConnection()}
    let collection = DBclient.db("WebwareFinal").collection("Drawings")
    await collection.insertOne(drawing)
}


///////////////////////////////////// Geolocation ///////////////////////////////////////
const token = process.env.IPINFO_TOKEN
const ipinfo = new IPinfo(token);

async function ipToCountryCode(req) {
    let clientIP
    try {
        clientIP = req.headers['x-forwarded-for'].split(',')[0]
    } catch (TypeError) {
        console.log('no ip')
        return null
    }
    return ipinfo.lookupIp(clientIP)
}

async function ipToFlagPath(req) {
    let cc = await ipToCountryCode(req)
    if (cc === null) {
        return `images/flags/PF.png`
    } else {
        return `images/flags/${cc._countryCode}.png`
    }
}

////////////////////////////////// Communication Socket //////////////////////////////////

const socketServer = new ws.Server({ server })
const clients = [] //has usernames attached to client objects.
const clientObjects = []; //stores client objects for before we have a username
socketServer.on( 'connection', client => {
    // add client to client list and send first message
    clientObjects.push(client)
    client.send(
        JSON.stringify({
            value:'you have connected'
            // we only initiate p2p if this is the second client connected
            //initiator:++count % 2 === 0
        })
    )

    // when the server receives a message from this client...
    client.on( 'message', msg => {
        console.log(msg);
        let msgJson = JSON.parse(msg);
        if(msgJson.type === "sendingUsername") {
            // See if someone already exists with this username. if so, replace their client
            // object with the new one.
            let userExists = false;
            for(let i = 0; i < clients.length; i++) {
                if(clients[i].user === msgJson.username) {
                    clients[i].client = client;
                    userExists = true;
                    break;
                }
            }
            if(!userExists) {
                clients.push({user:msgJson.username, client:client});
            }
        } else if (msgJson.type === "notification") {

            //notify the client that is the target of the message that they have a new message.
            //client might not currently be connected, in that case we don't send to them because bad.
            // loop through the list of active clients to try to find them
            // if the user isn't found, just don't send and move on with life
            for(let i = 0; i < clients.length; i++) {

                if(clients[i].user === msgJson.receiver) {

                    try {
                        clients[i].client.send(JSON.stringify({sender:msgJson.sender}))
                        console.log("notification sent!")
                    } catch {
                        //the user we tried to send to isn't online, remove them.
                        console.log("user " + clients[i].user + " is offline");
                        clients.splice(i, 1);
                    }
                }
            }
        }
    })
})

////////////////////////////////// Graceful Termination //////////////////////////////////
function cleanup() {
    console.log("Cleaning up...")
    if (DBclient) DBclient.close()
    process.exit(0)
}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)
