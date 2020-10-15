// @author: Luke Bodwell
"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	groupId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	senderId: {
		type: Schema.Types.ObjectId,
		required: true	
	},
	content: {
		type: String,
		required: true
	},
	edited: {
		type: Boolean,
		required: true
	},
	dateSent: {
		type: Date,
		required: true,
		default: Date.now
	}
});

module.exports = mongoose.model("Message", MessageSchema);