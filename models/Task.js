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
	group_id: {
		type: String,
		required: true
	},
	column_name: {
		type: String,
		required: true
	},
	assignees: {
		type: [String],
		required: false
	},
	tags: {
		type: [String],
		required: false
	},
	date_due: {
		type: Date,
		required: false
	},
	date_created: {
		type: Date,
		required: true,
		default: Date.now
	}
});

module.exports = mongoose.model("task", TaskSchema);