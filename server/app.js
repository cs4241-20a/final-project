require('dotenv').config()
const express = require('express')
const body_parser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const cors = require('cors')
const path = require('path')

global.upload_path = path.join(__dirname, 'uploads')

const MongoStore = require('connect-mongo')(session)
const mongoose_connection = require('./db')
const routes = require('./routes')

function launch() {
	const app = express()
	const port = process.env.PORT || 40404

	app.use(body_parser.urlencoded({ extended: true }))
	app.use(body_parser.json())
	app.use(cors({origin: 'http://localhost:3000', optionsSuccessStatus: 200, credentials: true}))
	app.use(session({
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
		secret: process.env.SESSION_SECRET,
		saveUninitialized: false,
		resave: false,
		cookie: {
			maxAge: 1000*60*60*24*7 // Sessions are to expire after 1 week
		}
	})
	)

	app.use(routes)
	app.use(express.static(path.join(__dirname, 'build')))
	app.get('/', function(req, res) {
		res.sendFile(path.join(__dirname, 'build', 'index.html'))
	})
	app.use('/files', express.static(global.upload_path))

	app.listen(port, () =>
		console.log(`server listening on port ${port}!`)
	)
}

mongoose_connection(launch)