// @author: Luke Bodwell
"use strict";

const express = require("express");

const Group = require("../../models/Group");
const User = require("../../models/User");
const githubAuth = require("../auth/github-auth");

const router = express.Router();
const {ensureAuthenticated} = githubAuth;

/*
 * Route: /api/groups/
 * Method: GET
 * Auth: Required
 * Desc: Gets all groups the current user belongs to. Verified by session.
 */
router.get("/:id", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const {username} = req.user;

	try {
		// Find the user with the given username
		const currentUser = await User.findOne({username});
		// Find the groups the user with the given id belongs to
		const groups = await Group.find({members: currentUser._id});

		// Send result
		res.status(200).json({success: true, data: groups});
	} catch (err) {
		// Report errors
		res.status(500).send({success: false, error: err});
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
	const {username} = req.user;

	try {
		// Find the user with the given username
		const currentUser = await User.findOne({username});
		// Find the group with the given group id, ensuring the current user belongs to it
		const group = await Group.findOne({_id: groupId, members: currentUser._id});

		// Send result
		res.status(200).json({success: true, data: group});
	} catch (err) {
		// Report errors
		res.status(500).send({success: false, error: err});
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
	const {username} = req.user;

	try {
		// Find the id of user with the given username
		const adminId = await User.findOne({username})._id;
		// Create a new group with the given name and admin id
		const newGroup = await new Group({name, adminId, members: [adminId]}).save();

		// Send result
		res.status(201).json({success: true, data: newGroup});
	} catch (err) {
		// Report errors
		res.status(500).send({success: false, error: err});
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
	const {username} = req.user;

	try {
		// Find the user with the given username
		const currentUser = await User.findOne({username});
		// Find and delete the group with the given id if the current user is the admin
		await Group.findOneAndDelete({_id: groupId, adminId: currentUser._id});

		// Send result
		res.status(204).send({success: true});
	} catch (err) {
		// Report errors
		res.status(500).send({success: false, error: err});
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
	const {members} = req.body;
	const {username} = req.user;

	try {
		// Find the user with the given username
		const currentUser = await User.findOne({username});
		// Find and update member list of the group with the given id, ensuring the current user is a member of the group
		const group = await Group.findOneAndUpdate({_id: groupId, members: currentUser._id}, {members});
		// Send result
		res.status(200).send({success: true, data: group});
	} catch (err) {
		// Report errors
		res.status(500).send({success: false, error: err});
	}
});

module.exports = {router};