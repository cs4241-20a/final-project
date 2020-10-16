const express = require('express'),
      path = require('path'),
      passport = require('passport')
const router = express.Router()
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth')

router.get('/', ensureAuthenticated, (req, res) => {
  console.log(req.user)
  res.sendFile( path.join(__dirname, '../public/html/index.html') )
})


router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname , '../public/html/register.html') )
})

router.get('/login', forwardAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname , '../public/html/login.html') )
})

// router.get('/welcome', (req, res) => {
//     res.sendFile(path.join(__dirname, '../public/html/welcome.html'))
// })


module.exports = router