"use strict";

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(express.static('public', {extensions: 'html'}))

server = app.listen(process.env.PORT || 3000);