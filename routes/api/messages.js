"use strict";

const express = require("express");

const Message = require("../../models/Message");
const Group = require("../../models/Group");
const githubAuth = require("../auth/github-auth");

const router = express.Router();
const {ensureAuthenticated} = githubAuth;

/*
 * Route: /api/messages/:id
 * Method: GET
 * Auth: Required
 * Gets all messages in the given group. User must belong to the group. Verified by session.
 */
router.get("/:id", ensureAuthenticated, (req, res) => {
	// Gather request parameters
	const {username} = req.user;
	const {groupId} = req.params.id;
	
	try {
		// Verify that a group exists with the given id that the current user is a member of
		await Group.find({_id: groupId, members: username});
		// Find all messages with the given group id
		const messages = await Message.find({groupId});
		// Send result
		res.status(200).res.json({success: true, data: messages});
	} catch (err) {
		// Report errors
		res.status(500).send({success: false, error: err});
	}
});

module.exports = {router};