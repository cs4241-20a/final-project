/* eslint-disable no-proto */
const fs = require('fs')
const express = require('express')
const multer = require('multer')
const { v4 } = require('uuid')
const Upload = require('../file_upload')

const router = express.Router()
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, global.upload_path)
	},
	filename: function (req, file, cb) {
		cb(null, v4())
	}
})
const upload = multer({ storage: storage })

// File Submission Form
router.post('/', upload.single('file'), function (req, res) {
	try {
		const id = req.session.user._id
		const params = {uploader_id: id, uploader: req.body.uploader, title: req.body.title }
		params.file_name = req.file.originalname
		params.upload_path = req.file.path
		params.upload_name = req.file.filename
		params.mime_type = req.file.mimetype
		params.size = req.file.size
		new Upload(params).save().then((u) => {
			const result = u.toJSON({virtuals: true})
			res.status(201).json(result)
		})
	}
	catch(err) {
		console.err(err)
		if(req.file) {
			fs.unlinkSync(req.file.path)
		}
		res.send('Error: ' + err)
	}
})

router.delete('/:id', async function (req, res) {
	const id = req.params.id
	let file

	try {
		file = await Upload.findOne({_id: id})
	} catch (err) {
		res.status(404).send(`Unable to retrive upload entry with Id ${id}`)
		return
	}

	if (req.session.user._id != file.uploader_id){
		res.status(403).send('You do not have permission to delete this file')
		return
	}

	if(await Upload.deleteOne({_id: id})){
		fs.unlinkSync(file.upload_path)
		res.status(200).send()
	}
	else {
		res.status(500)
	}
})

router.get('/', function (req, res) {
	let {page, limit} = req.query
	if(page === undefined || limit === undefined) {
		res.status(400).send('Missing one or both of the following query parameters: page, limit.')
		return
	}
	page = parseInt(page)
	limit = parseInt(limit)
	if(isNaN(page) || isNaN(limit)){
		res.status(400).send('One or both of the following query parameters are invalid: page, limit.')
		return
	}

	Upload.paginate(undefined, {page: page, limit: limit, sort: {updatedAt: 'desc'}}).then((page) => {
		const entries = []
		const results = page.docs
		results.forEach(result => {
			const entry = result.toJSON({virtuals: true})
			entry.created_at = entry.createdAt
			entry.updated_at = entry.updatedAt
			delete entry.createdAt
			delete entry.updatedAt
			entries.push(entry)
		})
		res.json(entries)
	}).catch(err => {
		res.send('Error: ' + err)
	})
})

router.get('/user', function (req, res) {
	let {page, limit} = req.query
	let {_id} = req.session.user
	if(page === undefined || limit === undefined) {
		res.status(400).send('Missing one or both of the following query parameters: page, limit.')
		return
	}
	page = parseInt(page)
	limit = parseInt(limit)
	if(isNaN(page) || isNaN(limit)){
		res.status(400).send('One or both of the following query parameters are invalid: page, limit.')
		return
	}

	Upload.paginate({uploader_id: _id}, {page: page, limit: limit, sort: {updatedAt: 'desc'}}).then((page) => {
		const entries = []
		const results = page.docs
		results.forEach(result => {
			const entry = result.toJSON({virtuals: true})
			entry.created_at = entry.createdAt
			entry.updated_at = entry.updatedAt
			delete entry.createdAt
			delete entry.updatedAt
			entries.push(entry)
		})
		res.json(entries)
	}).catch(err => {
		res.send('Error: ' + err)
	})
})

router.put('/:id', async function(req, res){
	let file
	let id = req.params.id
	let {title, uploader} = req.body
	try {
		file = await Upload.findOne({_id: id})
	} catch (err) {
		res.status(404).send(`Unable to retrive upload entry with Id ${id}`)
		return
	}

	if (req.session.user._id != file.uploader_id){
		res.status(403).send('You do not have permission to update this file')
		return
	}

	file.title = title
	file.uploader = uploader
	file.save().then(() => {
		const data = file.toJSON({virtuals: true})
		data.created_at = data.createdAt
		data.updated_at = data.updatedAt
		delete data.createdAt
		delete data.updatedAt
		res.status(200).json(data)
	}).catch((err) => {
		res.status(500).send(err._message)
	})
})

router.get('/capacity', async function (req, res) {
	Upload.aggregate([{ $group: { _id: null, size: { $sum: '$size' } }}]).exec((err, data) => {
		if(err){
			res.json({error: err})
		}
		else{
			if(!data[0])
				res.json({capacity: 0})
			else
				res.json({capacity: data[0].size})
		}
	})
})

module.exports = router
