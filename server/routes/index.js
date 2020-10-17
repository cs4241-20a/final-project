const express = require('express')
const router = express.Router()
const uploads = require('./uploads')
const auth = require('./auth')
const drawings = require('./drawings')

router.use('/auth', auth)
router.use('/uploads', uploads)
router.use('/drawings', drawings)
module.exports = router
