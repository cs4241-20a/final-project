"use strict";

const express = require("express");

const users = require("./users");
const groups = require("./groups");
const tasks = require("./tasks");
const messages = require("./messages");

const router = express.Router();

router.use("/users", users.router);
router.use("/groups", groups.router);
router.use("/tasks", tasks.router);
router.use("/messages", messages.router);

module.exports = {router};