"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	admin_id: {
		type: String,
		required: true
	},
	members: {
		type: [Schema.Types.ObjectId],
		ref: "User",
		required: true	
	}
});

module.exports = mongoose.model("Group", GroupSchema);