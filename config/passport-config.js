const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;

const setupPassport = () => {
	const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
	const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
	const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
	const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

	passport.serializeUser((user, done) => done(null, user));
	passport.deserializeUser((obj, done) => done(null, obj));
	
	passport.use(new GitHubStrategy({
		clientID: GITHUB_CLIENT_ID,
		clientSecret: GITHUB_CLIENT_SECRET,
		callbackURL: "https://webware-team19-final.herokuapp.com/auth/github/callback"
	}, (accessToken, refreshToken, profile, done) => process.nextTick(() => {
		done(null, profile);
	})));

	passport.use(new GoogleStrategy({
		clientID: GOOGLE_CLIENT_ID,
		clientSecret: GOOGLE_CLIENT_SECRET,
		callbackURL: "https://webware-team19-final.herokuapp.com/auth/google/callback"
	}, (accessToken, refreshToken, profile, done) => process.nextTick(() => {
		done(null, profile);
	})));
};

const ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.status(401).redirect("/login");
};

const getUsername = req => {
	if (req.isAuthenticated()) {
		if (req.user.username) {
			return req.user.username;
		} else if (req.user.provider === "google") {
			return req.user.name.givenName.toLowerCase() + req.user.name.familyName.toLowerCase();
		}
	}
	return undefined;
};

module.exports = {setupPassport, ensureAuthenticated, getUsername};