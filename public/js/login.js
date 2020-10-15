"use strict";

document.getElementById("login-button").addEventListener("click", evt => {
	evt.preventDefault();
	window.location.href = "/auth/github/login";
});