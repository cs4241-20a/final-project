"use strict";

const express = require("express");

const User = require("../../models/User");
const githubAuth = require("../auth/github-auth");

const router = express.Router();

// Route: /api/users
// Method: GET
// Auth: Required
// Returns JSON of current user determined by session token
router.get("/", githubAuth.ensureAuthenticated, async (req, res) => {
	try {
		res.status(202).json(await User.findOne({username: req.user.username}));
	} catch {
		res.status(404).send({success: false, error: "User not found."});
	}
});

// Route: /api/users/:id
// Method: GET
// Auth: Not required
// Returns JSON of user with the given id
router.get("/:id", async (req, res) => {
	res.json(await User.findOne({_id: req.params.id}));
});

// Route: /api/users
// Method: POST
// Auth: Required
// Adds a new user with the display name and username given by session token
router.post("/", githubAuth.ensureAuthenticated, async (req, res) => {
	const name = req.user.displayName;
	const username = req.user.username;
	const newUser = new User({name, username, groups: []});
	try {
		res.status(204).json({success: true, data: await newUser.save()});
	} catch (err) {
		res.status(404).send({success: false, error: err});
	}
});

// Route: /api/users/:id
// Method: DELETE
// Auth: Required
// Deletes the current user given by session token.
router.delete("/:id", githubAuth.ensureAuthenticated, async (req, res) => {
	try {
		await User.findOneAndDelete({username: req.user.username});
		res.status(204).send({success: true});
	} catch {
		res.status(404).send({success: false, error: "User not found."});
	}
});

// Route: /api/users/:id
// Method: PATCH
// Auth: Required
// Updates the groups of the current user given by session token.
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