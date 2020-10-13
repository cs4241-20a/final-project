"use strict";

const express = require("express");

const Group = require("../../models/Group");
const User = require("../../models/User");
const githubAuth = require("../auth/github-auth");

const router = express.Router();

/**
 * Route: /api/groups/:id
 * Method: GET
 * Auth: Required
 * Desc: returns JSON of the group with the given id. User must belong to group. Verified by session token.
 */
router.get("/:id", githubAuth.ensureAuthenticated, async (req, res) => {
	try {
		const currentUser = await User.findOne({username: req.user.username});
		res.status(202).json(await Group.findOne({_id: req.params.id, members: currentUser._id}));
	} catch {
		res.status(404).send({success: false, error: "User not found."});
	}
});

/**
 * Route: /api/groups
 * Method: POST
 * Auth: Required
 * Desc: Adds a new group with the given name, adds the current user to the member list, sets them as admin,
 * and adds the group to their list of groups. Verified by session token.
 */
router.post("/", githubAuth.ensureAuthenticated, async (req, res) => {
	try {
		const currentUser = await User.findOne({username: req.user.username});
		const newGroup = await new Group({
			name: req.body.name,
			admin: currentUser._id,
			members: [currentUser._id]
		}).save();
		currentUser.groups = [...currentUser.groups, newGroup._id];
		res.status(204).json({success: true, data: await currentUser.save()});
	} catch (err) {
		res.status(404).send({success: false, error: err});
	}
});

/**
 * Route: /api/groups/:id
 * Method: DELETE
 * Auth: Required
 * Desc: Deletes the group with the given id. User must be admin of the group. Verified by session token.
 */
router.delete("/:id", githubAuth.ensureAuthenticated, async (req, res) => {
	const groupId = req.params.id;
	try {
		const currentUser = await User.findOne({username: req.user.username});
		await Group.findOneAndDelete({admin: currentUser._id, _id: groupId});
		// ? This might not work right. Requires further testing.
		await User.updateMany({groups: groupId}, {$pull: {groups: groupId}});
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
	const groupId = req.params.id;
	const {addedUsers} = req.body;
	try {
		const currentUser = await User.findOne({username: req.user.username});
		const currentGroup = await Group.findOne({_id: groupId, members: currentUser._id});
		// ? This might not work right. Requires further testing.
		currentGroup.members = [...currentGroup.members].concat(addedUsers);
		// ? This might not work right. Requires further testing.
		await User.updateMany({_id: addedUsers}, {$push: {groups: groupId}});
		res.status(204).send({success: true, data: await currentGroup.save()});
	} catch {
		res.status(404).send({success: false, error: "User not found."});
	}
})

module.exports = {router};