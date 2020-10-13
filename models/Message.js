"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	groupId: {
		type: String,
		required: true
	},
	senderId: {
		type: String,
		required: true	
	},
	content: {
		type: String,
		required: true
	},
	dateSent: {
		type: Date,
		required: true,
		default: Date.now
	}
});

module.exports = mongoose.model("Message", MessageSchema);