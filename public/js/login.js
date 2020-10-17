"use strict";

document.getElementById("github-login-button").addEventListener("click", evt => {
	evt.preventDefault();
	window.location.href = "/auth/github/login";
});

document.getElementById("google-login-button").addEventListener("click", evt => {
	evt.preventDefault();
	window.location.href = "/auth/google/login";
});