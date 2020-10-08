"use strict";

const express = require("express");

const Message = require("../../models/Message");
const githubAuth = require("../auth/github-auth");

const router = express.Router();

router.get("/", (req, res) => {
	res.send("messages endpoint");
});

module.exports = {router};