const express = require('express')
const router = express.Router()
const uploads = require('./uploads')
const auth = require('./auth')

router.use('/auth', auth)
router.use('/uploads', uploads)

module.exports = router
