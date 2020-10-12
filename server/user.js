let mongoose = require('mongoose')

let userSchema = mongoose.Schema({
	google_id: {
		type: String,
		unique: true
	},
	email: {
		type: String,
		unique: true
	}, 
	name: {
		type: String
	}
},
{
	timestamps: true
})

userSchema.statics.findOrCreate = function findOrCreate(condition, callback) {
	const self = this
	self.findOne(condition, (err, result) => {
		return result ? callback(err, result) : self.create(condition, (err, result) => { return callback(err, result) })
	})
}

module.exports = mongoose.model('User', userSchema)