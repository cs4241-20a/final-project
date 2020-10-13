"use strict";

const express = require("express");

const User = require("../../models/User");
const githubAuth = require("../auth/github-auth");

const router = express.Router();

/**
 * Route: /api/users
 * Method: GET
 * Auth: Required
 * Returns the current user based on the session token.
 */
router.get("/", githubAuth.ensureAuthenticated, async (req, res) => {
	const username = req.user.username
	try {
		res.status(200).json(await User.findOne({username}));
	} catch (err) {
		res.status(500).send({success: false, error: err});
	}
});

/**
 * Route: /api/users/:id
 * Method: GET
 * Auth: Not required
 * Returns the user with the given id.
 */
router.get("/:id", async (req, res) => {
	const _id = req.params.id;
	try {
		res.status(200).res.json(await User.findOneById({_id}));
	} catch (err) {
		res.status(500).send({success: false, error: err});
	}
});

/**
 * Route: /api/users
 * Method: POST
 * Auth: Required
 * Adds a new user with the display name and username determined by the session token.
 */
router.post("/", githubAuth.ensureAuthenticated, async (req, res) => {
	const name = req.user.displayName;
	const username = req.user.username;
	const newUser = new User({name, username, groups: []});
	try {
		res.status(201).json({success: true, data: await newUser.save()});
	} catch (err) {
		res.status(500).send({success: false, error: err});
	}
});

/**
 * Route: /api/users/
 * Method: DELETE
 * Auth: Required
 * Deletes the current user determined by the session token.
 */
router.delete("/", githubAuth.ensureAuthenticated, async (req, res) => {
	const {username} = req.user;
	try {
		await User.findOneAndDelete({username});
		res.status(204).send({success: true});
	} catch (err) {
		res.status(500).send({success: false, error: err});
	}
});

module.exports = {router};