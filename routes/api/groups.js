"use strict";

const express = require("express");

const Group = require("../../models/Group");
const githubAuth = require("../auth/github-auth");

const router = express.Router();

router.get("/", (req, res) => {
	res.send("groups endpoint");
});

module.exports = {router};