const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const uploadSchema = mongoose.Schema({
	uploader_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	uploader: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	file_name: {
		type: String,
	}, 
	upload_path: {
		type: String,
		required: true
	},
	upload_name: {
		type: String,
		required: true
	},
	mime_type: {
		type: String
	},
	size: {
		type: Number
	}
},
{
	timestamps: true
})

uploadSchema.virtual('file_ext').get(function(){
	if (this.file_name.includes('.')) {
		return this.file_name.slice(this.file_name.lastIndexOf('.'))
	}
	return null
})

uploadSchema.virtual('download_path').get(function(){
	return `/files/${this.upload_name}`
})

uploadSchema.virtual('size_formatted').get(function(){
	if (this.size >= 1000000) {
		return `${(this.size / 1000000.0).toFixed(2)}MB`
	} else if (this.size >= 1000) {
		return `${(this.size / 1000.0).toFixed(2)}KB`
	}
	return `${this.size}B`
})

uploadSchema.virtual('quota_percentage').get(function(){
	return `${((this.size / 200000000.0) * 100).toFixed(3)}%` // 200MB max (soft limit) storage
})

mongoose.plugin(mongoosePaginate)

module.exports = mongoose.model('Upload', uploadSchema)