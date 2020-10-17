const router = require('express').Router()
const Drawing = require('../drawing_upload')

// Ensures authentication
const auth = function(req, res, next){
	if(!req.session.user || !req.session.authenticated)
		res.status(403).json({error: 'User Authentication Required'})
	else {
		req.user_id = req.session.user._id
		next()
	}
}

// Ensures the necessary query parameters are provided
const validate_query = function(param_list){
	return function(req,res,next){
		const missing_params = param_list.filter(x => !(x in req.query))
		if(missing_params.length > 0)
			res.status(400).json({error: `Missing the following query parameters: [${missing_params}]`})
		else
			next()
	}
}

// Ensures the necessary body parameters are provided
const validate_body = function(param_list){
	return function(req,res,next){
		const missing_params = param_list.filter(x => !(x in req.body))
		if(missing_params.length > 0)
			res.status(400).json({error: `Missing the following body parameters: [${missing_params}]`})
		else
			next()
	}
}

const paginate = function(filter_by_id){
	return function(req, res){
		let {page, limit} = req.query
		let filter = {published: true}
		if(filter_by_id == true)
			filter = {user_id: req.user_id}
		page = parseInt(page)
		limit = parseInt(limit)
		if(isNaN(page) || isNaN(limit)){
			res.status(400).json({error: 'Page and limit must be integers'})
		}
		Drawing.paginate(filter, {page: page, limit: limit, sort: {updated_at: 'desc'}}).then((page) => {
			const results = page.docs.map(doc => doc.toJSON())
			res.json(results)
		}).catch((err) => {res.status(500).json({error: err})})
	}
	
}

router.param('id', function(req, res, next, id){
	Drawing.findById(id).then((doc) => {
		if(doc == null){
			res.status(404).json({error: 'Drawing entry not found.'})
		}
		else{
			req.drawing = doc
			next()
		}
	}).catch((err) => {res.status(500).json({error: err})})
})


router.get('/feed/user', auth, validate_query(['page', 'limit']), paginate(true))
router.get('/carousel', function(req, res){
	Drawing.paginate({published: true}, {page: 1, limit: 5, sort: {updated_at: 'desc'}}).then((page) => {
		const results = page.docs.map(doc => doc.toJSON())
		res.json(results)
	}).catch((err) => {res.status(500).json({error: err})})
})

router.get('/feed', validate_query(['page', 'limit']), paginate())

router.post('/', auth, validate_body(['artist', 'title', 'canvas_data']), function(req, res){
	const fields = (({artist, title, canvas_data, published}) => ({artist, title, canvas_data, published}))(req.body)
	fields.user_id = req.user_id
	new Drawing(fields).save().then((doc) => {
		res.status(201).json(doc.toJSON())
	}).catch((err) => {res.status(500).json({error: err})})
})

router.put('/:id', auth, function(req, res){
	const fields = (({artist, title, canvas_data, published}) => ({artist, title, canvas_data, published}))(req.body)
	Object.keys(fields).forEach(key => fields[key] === undefined && delete fields[key])
	Object.assign(req.drawing, fields)
	req.drawing.save().then((doc) => {
		res.json(doc.toJSON())
	}).catch((err) => {res.status(500).json({error: err})})
})

router.get('/:id', function(req, res){
	res.json(req.drawing.toJSON())
})

router.delete('/:id', auth, function(req, res){
	const post = req.drawing
	if(post.user_id != req.user_id){
		res.status(403).send({error: 'You are unauthorized to delete this post'})
		return
	}
	Drawing.findByIdAndDelete(post._id).then(() => {
		res.status(200).send()
	}).catch((err) => {res.status(500).json({error: err})})
})



module.exports = router
