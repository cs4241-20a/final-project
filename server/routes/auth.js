const router = require('express').Router()
const axios = require('axios')
const User = require('../user')

// const CLIENT_ID = process.env.GOOGLE_OAUTH_ID
// const CLIENT_SECRET = process.env.GOOGLE_OAUTH_SECRET
// const port = process.env.HOSTED_PORT? ':' + process.env.HOSTED_PORT : ''
// // const callback_url = `http://${process.env.HOST}${port}${process.env.PREFIX || ''}/auth/callback`
// const callback_url = '/auth/callback'


router.get('/check', function(req, res){
	if(req.session.authenticated) {
		const response = Object.assign({authenticated: true}, req.session.user)
		res.json(response)
	}
	else {
		res.json({authenticated: false})
	}
})

router.get('/callback', async function(req, res){
	const {auth_token} = req.query
	if (auth_token == undefined) {
		res.status(400).send({error: 'OAuth token parameter required'})
		return
	}
	const profile_response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + auth_token).catch((err) => {res.status(403).json({error: err}); return})
	const ginfo = profile_response.data
	let user = await User.findOne({google_id: ginfo.sub})
	if(user == null) {
		user = new User({google_id: ginfo.sub, email: ginfo.email, name: (ginfo.name || 'Unnamed User')})
		await user.save().catch((err) => {console.error(err); res.status(500).json({error: err}); return})
	}
	req.session.user = user
	req.session.authenticated = true
	res.json(user.toJSON())
})

router.get('/signout', function(req, res){
	req.session.destroy()
	res.status(200).send()
})

router.get('/user', function(req, res) {
	if(req.user) {
		res.json({user: req.user})
	}
	else{
		res.status(404).json({})
	}
})
module.exports = router