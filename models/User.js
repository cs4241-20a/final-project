"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: {
		type: String,
		required: true	
	},
	name: {
		type: String,
		required: true
	},
	groups: {
		type: [String],
		required: true
	}
});

module.exports = mongoose.model("user", UserSchema);