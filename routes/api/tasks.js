// @author: Luke Bodwell
"use strict";

const express = require("express");

const Task = require("../../models/Task");
const Group = require("../../models/Group");
const User = require("../../models/User");
const githubAuth = require("../auth/github-auth");

const router = express.Router();

/*
 * Route: /api/tasks/:groupId
 * Method: GET
 * Auth: Required
 * Desc: Gets all tasks in the given group. User must belong to the group. Verified by session.
 */
router.get("/:groupId", ensureAuthenticated, (req, res) => {

});

/*
 * Route: /api/tasks/:groupId/:taskId
 * Method: GET
 * Auth: Required
 * Desc: Gets the tasks with the given id in the given group. User must belong to the group. Verified by session.
 */
router.get("/:groupId/:taskId", ensureAuthenticated, (req, res) => {

});

/*
 * Route: /api/tasks/:groupId
 * Method: POST
 * Auth: Required
 * Desc: Adds a new task to the given group with the given information. User must belong to the group. Verified by session.
 */
router.post("/:groupId", ensureAuthenticated, (req, res) => {

});

/*
 * Route: /api/tasks/:groupId/:taskId
 * Method: DELETE
 * Auth: Required
 * Desc: Deletes the task with the given id. User must belong to the group. Verified by session.
 */
router.delete("/:groupId/:taskId", ensureAuthenticated, (req, res) => {

});

/*
 * Route: /api/tasks/:groupId/:taskId
 * Method: PATCH
 * Auth: Required
 * Desc: Updates the information of the task with the given id. User must belong to group and be the sender of the message.
 * Verified by session.
 */
router.patch("/:groupId/:taskId", ensureAuthenticated, (req, res) => {

});

module.exports = {router};