"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	group_id: {
		type: String,
		required: true
	},
	sender_id: {
		type: String,
		required: true	
	},
	content: {
		type: String,
		required: true
	},
	date_sent: {
		type: Date,
		required: true,
		default: Date.now
	}
});

module.exports = mongoose.model("message", MessageSchema);