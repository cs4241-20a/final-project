"use strict";

const express = require("express");

const User = require("../../models/User");
const githubAuth = require("../auth/github-auth");

const router = express.Router();

router.get("/", (req, res) => {
	res.send("users endpoint");
});

module.exports = {router};