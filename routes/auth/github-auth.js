// @author: Luke Bodwell
"use strict";

const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

const router = express.Router();

//? Consider moving to different file (not necessarily specific to GitHub auth)
const ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.status(401).redirect("/login");
}

//? Consider moving to different file (not necessarily specific to GitHub auth)
const setupPassport = () => {
	const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
	const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

	passport.serializeUser((user, done) => done(null, user));
	passport.deserializeUser((obj, done) => done(null, obj));
	
	passport.use(new GitHubStrategy({
		clientID: GITHUB_CLIENT_ID,
		clientSecret: GITHUB_CLIENT_SECRET,
		callbackURL: "http://localhost:3000/auth/github/callback"
	}, (accessToken, refreshToken, profile, done) => process.nextTick(() => done(null, profile))));
}

router.get('/login', passport.authenticate("github", {
	scope: ["user:email"]
}));

router.get("/callback", passport.authenticate("github", {
	failureRedirect: "/login" 
}), (req, res) => res.redirect("../../"));

router.get("/account", (req, res) => {
	if (req.isAuthenticated()) {
		res.send(`Hello, ${req.user.displayName}!`);
	} else {
		res.send("You are not logged in.");
	}
	
});

module.exports = {router, passport, ensureAuthenticated, setupPassport};