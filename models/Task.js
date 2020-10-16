// @author: Luke Bodwell
"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TaskSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	desc: {
		type: String,
		required: false
	},
	groupId: {
		type: Schema.Types.ObjectId,
		ref: "Group",
		required: true
	},
	columnName: {
		type: String,
		required: true
	},
	assignees: {
		type: [Schema.Types.ObjectId],
		ref: "User",
		required: false
	},
	tags: {
		type: [String],
		required: false
	},
	dateDue: {
		type: Date,
		required: false
	},
	dateCreated: {
		type: Date,
		required: true,
		default: Date.now
	}
});

module.exports = mongoose.model("Task", TaskSchema);