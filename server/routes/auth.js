const router = require('express').Router()
const {OAuth2Client} = require('google-auth-library')
const User = require('../user')

const CLIENT_ID = process.env.GOOGLE_OAUTH_ID
const oauth_client = new OAuth2Client(CLIENT_ID)


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
	const {id_token} = req.query
	if (id_token == undefined) {
		res.status(400).json({error: 'OAuth id_token parameter required.'})
		return
	}
	const ticket = await oauth_client.verifyIdToken({idToken: id_token, audience: CLIENT_ID})
		.catch((err) => {
			res.status(500).status({error: err})
			return
		})
	if(ticket === undefined){
		res.status(400).json({error: 'Invalid or expired id_token.'})
		return
	}

	const ginfo = ticket.getPayload()

	let user = await User.findOne({google_id: ginfo.sub})
	let new_user = false
	if(user == null) {
		new_user = true
		user = new User({google_id: ginfo.sub, email: ginfo.email, name: (ginfo.name || 'Unnamed User'), profile_url: ginfo.picture})
		await user.save().catch((err) => {res.status(500).json({error: err}); return})
	}
	req.session.user = user
	req.session.authenticated = true
	const result = Object.assign({authenticated: true}, {user: user.toJSON()})
	if(new_user)
		res.status(201).json(result)
	else
		res.json(result)
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