"use strict";

const express = require("express");

const Task = require("../../models/Task");
const githubAuth = require("../auth/github-auth");

const router = express.Router();

router.get("/", (req, res) => {
	res.send("tasks endpoint");
});

module.exports = {router};