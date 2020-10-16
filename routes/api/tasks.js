// @author: Luke Bodwell
"use strict";

const express = require("express");
const moment = require("moment");

const Task = require("../../models/Task");
const Group = require("../../models/Group");
const User = require("../../models/User");
const passportConfig = require("../../config/passport-config");

const router = express.Router();
const {ensureAuthenticated, getUsername} = passportConfig;

/*
 * Route: /api/tasks/:groupId
 * Method: GET
 * Auth: Required
 * Desc: Gets all tasks in the given group. User must belong to the group. Verified by session.
 */
router.get("/:groupId", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const {groupId} = req.params;
	const username = getUsername(req);
	
	try {
		// Find the id of the user with the given username
		const userId = (await User.findOne({username}))._id;
		// Verify that a group exists with the given id that the current user is a member of
		await Group.find({_id: groupId, members: userId});
		// Find all tasks with the given group id sorted by date sent (descending)
		const tasks = await Task.find({groupId}).sort({dateCreated: -1});

		// Send result
		res.status(200).json({success: true, data: tasks});
	} catch (err) {
		// Report errors
		res.status(500).json({success: false, error: err});
	}
});

/*
 * Route: /api/tasks/:groupId/:taskId
 * Method: GET
 * Auth: Required
 * Desc: Gets the tasks with the given id in the given group. User must belong to the group. Verified by session.
 */
router.get("/:groupId/:taskId", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const {groupId, taskId} = req.params;
	const username = getUsername(req);
	
	try {
		// Find the id of the user with the given username
		const userId = (await User.findOne({username}))._id;
		// Verify that a group exists with the given id that the current user is a member of
		await Group.find({_id: groupId, members: userId});
		// Find the task with the given id in the group with the given id
		const task = await Task.findOne({_id: taskId, groupId});

		// Send result
		res.status(200).json({success: true, data: task});
	} catch (err) {
		// Report errors
		res.status(500).json({success: false, error: err});
	}
});

/*
 * Route: /api/tasks/:groupId
 * Method: POST
 * Auth: Required
 * Desc: Adds a new task to the given group with the given information. User must belong to the group. Verified by session.
 */
router.post("/:groupId", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const {groupId} = req.params;
	const {name, desc, columnName, assignees, tags, dateDue} = req.body;
	const username = getUsername(req);

	try {
		// Find the id of the user with the given username
		const userId = (await User.findOne({username}))._id;
		// Verify that a group exists with the given id that the current user is a member of
		await Group.findOne({_id: groupId, members: userId});
		// Create a new task with the given name, description, column name, assignees, tags, and due date
		let newTask = new Task({name, desc, columnName, assignees, tags, dateDue: formatDate(dateDue)});
		// Save the new task to the database
		newTask = await newTask.save();

		// Send result
		res.status(201).json({success: true, data: newTask});
	} catch (err) {
		// Report errors
		res.status(500).json({success: false, error: err});
	}
});

/*
 * Route: /api/tasks/:groupId/:taskId
 * Method: DELETE
 * Auth: Required
 * Desc: Deletes the task with the given id. User must belong to the group. Verified by session.
 */
router.delete("/:groupId/:taskId", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const {groupId, taskId} = req.params;
	const username = getUsername(req);

	try {
		// Find the id of the user with the given username
		const userId = (await User.findOne({username}))._id;
		// Verify that a group exists with the given id that the current user is a member of
		const group = await Group.findOne({_id: groupId, members: userId});
		// Find and delete the task with the given id from the group with the given id
		await Task.findOneAndDelete({_id: taskId, groupId: group._id});

		// Send result
		res.status(204).json({success: true});
	} catch (err) {
		// Report errors
		res.status(500).json({success: false, error: err});
	}
});

/*
 * Route: /api/tasks/:groupId/:taskId
 * Method: PATCH
 * Auth: Required
 * Desc: Updates the information of the task with the given id. User must belong to group and be the sender of the message.
 * Verified by session.
 */
router.patch("/:groupId/:taskId", ensureAuthenticated, async (req, res) => {
	// Gather request parameters
	const {groupId, taskId} = req.params;
	const {name, desc, columnName, assignees, tags, dateDue} = req.body;
	const username = getUsername(req);

	try {
		// Find the id of the user with the given username
		const userId = (await User.findOne({username}))._id;
		// Verify that a group exists with the given id that the current user is a member of
		await Group.findOne({_id: groupId, members: userId});
		// Find the task with the given id in the group with the given id
		let task = await Task.findOne({_id: taskId, groupId});

		// Update fields based on request body
		task.name = name ? name : task.name;
		task.desc = desc ? desc : task.desc;
		task.columnName = columnName ? columnName : task.columnName
		task.assignees = assignees ? assignees : task.assignees;
		task.tags = tags ? tags : task.tags;
		task.dateDue = dateDue ? formatDate(dateDue) : task.dateDue;

		// Save updated task to database
		task = await task.save();

		// Send result
		res.status(200).json({success: true, data: task});
	} catch (err) {
		// Report errors
		res.status(500).json({success: false, error: err});
	}
});

const formatDate = dateStr => {
	//* This is expecting a date formatted as a string exactly as outputed from a datepicker.
	return moment(new Date(dateStr)).add(1, "days").format("MM/DD/YYYY"); 
}

module.exports = {router, formatDate};