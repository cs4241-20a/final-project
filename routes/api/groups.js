"use strict";

const express = require("express");

const Group = require("../../models/Group");
const githubAuth = require("../auth/github-auth");

const router = express.Router();

/*
	Route: /api/groups/:id
	Method: GET
	Auth: Required
	Returns JSON of the group with the given id. User must belong to group. Verified by session token.
*/
router.get("/:id", githubAuth.ensureAuthenticated, async (req, res) => {
	try {
		const currentUser = await User.findOne({username: req.user.username});
		res.status(202).json(await Group.findOne({_id: req.params.id, members: currentUser._id}));
	} catch {
		res.status(404).send({success: false, error: "User not found."});
	}
});

/*
	Route: /api/groups
	Method: POST
	Auth: Required
	Adds a new group with the given name, adds the current user to the member list, sets them as admin, and adds the group to their list of groups.
	Verified by session token.
*/
router.post("/", githubAuth.ensureAuthenticated, async (req, res) => {
	try {
		const currentUser = await User.findOne({username: req.user.username});
		const newGroup = new Group({name: req.body.name, admin: currentUser._id, members: [currentUser._id]});
		const groupId = await newGroup.save()._id;
		currentUser.groups = [...currentUser.groups, groupId];
		// TODO: finish this

		//res.status(204).json({success: true, data: });
	} catch (err) {
		res.status(404).send({success: false, error: err});
	}
});

// Route: /api/groups/:id
// Method: DELETE
// Auth: Required
// Deletes the user with the given id, verified by session token.
router.delete("/:id", githubAuth.ensureAuthenticated, async (req, res) => {
	try {
		await User.findOneAndDelete({username: req.user.username, _id: req.params.id});
		res.status(204).send({success: true});
	} catch {
		res.status(404).send({success: false, error: "User not found."});
	}
});

// Route: /api/groups/:id
// Method: PATCH
// Auth: Required
// Updates the groups of the user with the given id, verified by session token.
router.patch("/:id", githubAuth.ensureAuthenticated, async (req, res) => {
	const {groups} = req.body;
	try {
		const updatedUser = await User.findOneAndUpdate({username: req.user.username, _id: req.params.id}, {groups});
		res.status(204).send({success: true, data: updatedUser});
	} catch {
		res.status(404).send({success: false, error: "User not found."});
	}
})

module.exports = {router};