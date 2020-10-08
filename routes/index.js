const express = require('express'),
      path = require('path')
const router = express.Router()

router.get('/', (req, res) => {
    res.sendFile( path.join(__dirname, '../public/html/index.html') )
})

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname , '../public/html/register.html') )
})

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname , '../public/html/login.html') )
})


module.exports = router