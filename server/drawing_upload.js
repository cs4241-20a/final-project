const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')


const uploadSchema = mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	artist: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	}, 
	canvas_data: {
		type: String,
		required: true
	},
	published: {
		type: Boolean,
		required: true,
		default: false
	}
},
{timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }})


mongoose.plugin(mongoosePaginate)

module.exports = mongoose.model('Drawing', uploadSchema)