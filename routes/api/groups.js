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
 * Desc: returns the group with the given id. User must belong to group. Verified by session token.
 */
router.get("/:id", githubAuth.ensureAuthenticated, async (req, res) => {
	const _id = req.params.id;
	const {username} = req.user;
	try {
		const currentUser = await User.findOne({username});
		const group = await Group.findOne({_id, members: currentUser._id});
		res.status(200).json({success: true, data: group});
	} catch (err) {
		res.status(500).send({success: false, error: err});
	}
});

/**
 * Route: /api/groups
 * Method: POST
 * Auth: Required
 * Desc: Adds a new group with the given name, adds the current user to the member list, and sets them as admin.
 * Verified by session token.
 */
router.post("/", githubAuth.ensureAuthenticated, async (req, res) => {
	const name = req.body.name;
	const {username} = req.user;
	try {
		const currentUser = await User.findOne({username});
		const newGroup = await new Group({
			name,
			admin_id: currentUser._id,
			members: [currentUser._id]
		}).save();
		res.status(201).json({success: true, data: newGroup});
	} catch (err) {
		res.status(500).send({success: false, error: err});
	}
});

/**
 * Route: /api/groups/:id
 * Method: DELETE
 * Auth: Required
 * Desc: Deletes the group with the given id. User must be admin of the group. Verified by session token.
 */
router.delete("/:id", githubAuth.ensureAuthenticated, async (req, res) => {
	const _id = req.params.id;
	const {username} = req.user;
	try {
		const currentUser = await User.findOne({username});
		await Group.findOneAndDelete({_id, admin_id: currentUser._id});
		res.status(204).send({success: true});
	} catch (err) {
		res.status(500).send({success: false, error: err});
	}
});


/**
 * Route: /api/groups/:id
 * Method: PATCH
 * Auth: Required
 * Updates the members of the group with the given id. User must belong to group. Verified by session token.
 */
router.patch("/:id", githubAuth.ensureAuthenticated, async (req, res) => {
	const _id = req.params.id;
	const {members} = req.body;
	const {username} = req.user;
	try {
		const currentUser = await User.findOne({username});
		const currentGroup = await Group.findOneAndUpdate({_id, members: currentUser._id}, {members});
		res.status(200).send({success: true, data: currentGroup});
	} catch (err) {
		res.status(500).send({success: false, error: err});
	}
})

module.exports = {router};