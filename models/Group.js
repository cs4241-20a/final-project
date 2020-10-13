"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	admin: {
		type: String,
		required: true
	},
	members: {
		type: [String],
		required: true	
	}
});

module.exports = mongoose.model("group", GroupSchema);