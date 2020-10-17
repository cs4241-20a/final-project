// @author: Luke Bodwell
"use strict";

const express = require("express");

const Group = require("../../models/Group");
const User = require("../../models/User");
const passportConfig = require("../../config/passport-config");

const router = express.Router();
const {ensureAuthenticated, getUsername} = passportConfig;

/*
 * Route: /api/groups/
 * Method: GET
 * Auth: Required
 * Desc: Gets all groups the current user belongs to. Verified by session.
 */
router.get("/", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const username = getUsername(req);

	try {
		// Find the id of the user with the given username
		const userId = (await User.findOne({username}))._id;
		// Find the groups the user with the given id belongs to
		const groups = await Group.find({members: userId});

		// Send result
		res.status(200).json({success: true, data: groups});
	} catch (err) {
		// Report errors
		res.status(500).json({success: false, error: err});
	}
});

/*
 * Route: /api/groups/invites
 * Method: GET
 * Auth: Required
 * Desc: Gets all groups the current user has been invited to. Verified by session.
 */
router.get("/", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const username = getUsername(req);

	try {
		// Find the id of the user with the given username
		const userId = (await User.findOne({username}))._id;
		// Find the groups the user with the given id has been invited to
		const groups = await Group.find({invitees: userId});

		// Send result
		res.status(200).json({success: true, data: groups});
	} catch (err) {
		// Report errors
		res.status(500).json({success: false, error: err});
	}
});

/*
 * Route: /api/groups/:id
 * Method: GET
 * Auth: Required
 * Desc: Gets the group with the given id. User must belong to group. Verified by session.
 */
router.get("/:id", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const groupId = req.params.id;
	const username = getUsername(req);

	try {
		// Find the user with the given username
		const userId = (await User.findOne({username}));
		// Find the group with the given group id, ensuring the current user belongs to it
		const group = await Group.findOne({_id: groupId, members: userId});

		// Send result
		res.status(200).json({success: true, data: group});
	} catch (err) {
		// Report errors
		res.status(500).json({success: false, error: err});
	}
});

/*
 * Route: /api/groups
 * Method: POST
 * Auth: Required
 * Desc: Adds a new group with the given name, adds the current user to the member list, and sets them as admin.
 * Verified by session.
 */
router.post("/", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const {name} = req.body;
	const username = getUsername(req);

	try {
		// Find the id of user with the given username
		const adminId = (await User.findOne({username}))._id;
		// Create a new group with the given name and admin id
		let newGroup = new Group({name, adminId, members: [adminId], invitees: []});
		// Save the new message to the database
		newGroup = await newGroup.save();

		// Send result
		res.status(201).json({success: true, data: newGroup});
	} catch (err) {
		console.error(err);
		// Report errors
		res.status(500).json({success: false, error: err});
		console.log(err)
	}
});

/*
 * Route: /api/groups/:id
 * Method: DELETE
 * Auth: Required
 * Desc: Deletes the group with the given id. User must be admin of the group. Verified by session.
 */
router.delete("/:id", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const groupId = req.params.id;
	const username = getUsername(req);

	try {
		// Find the user with the given username
		const currentUser = (await User.findOne({username}));
		// Find and delete the group with the given id if the current user is the admin
		await Group.findOneAndDelete({_id: groupId, adminId: currentUser._id});

		// Send result
		res.status(204).json({success: true});
	} catch (err) {
		// Report errors
		res.status(500).json({success: false, error: err});
	}
});


/*
 * Route: /api/groups/:id
 * Method: PATCH
 * Auth: Required
 * Updates the members of the group with the given id. User must belong to group. Verified by session.
 */
router.patch("/:id", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const groupId = req.params.id;
	const {invitees, members} = req.body;
	const username = getUsername(req);

	try {
		// Find the id of the user with the given username
		const userId = (await User.findOne({username}))._id;
		// Find the group with the given id, ensuring the current user is a member of the group
		let group = await Group.findOne({_id: groupId, members: userId});

		// Update fields based on request body
		group.invitees = invitees ? invitees : group.invitees;
		group.members = members ? members : group.members;

		// Save updated group to database
		group = await group.save();

		// Send result
		res.status(200).json({success: true, data: group});
	} catch (err) {
		// Report errors
		res.status(500).json({success: false, error: err});
	}
});

module.exports = {router};
