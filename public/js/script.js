"use strict";

function colorClick(e) {
    document.getElementsByClassName("color selected")[0].className = "color";
    e.target.className = "color selected";
}

function brushClick(e) {
    document.getElementsByClassName("brush selected")[0].className = "brush";
    e.target.className = "brush selected";
}

function getImage(e) {
    let data = document.getElementById("centralCanvas").toDataURL()
    socket.emit("chat", {
        roomID,
        message: data,
    });
}

window.onload = function (e) {
    let buttons = document.getElementsByClassName("color");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", colorClick);
    }

    buttons = document.getElementsByClassName("brush");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", brushClick);
    }

    document.getElementById("send").addEventListener("click", getImage);

    document.addEventListener("click", function (e) {
        if (document.activeElement.toString() == "[object HTMLButtonElement]") {
            document.activeElement.blur();
        }
    });
};

//Socket code using jquery
var socket;
var roomID = window.location.pathname.split("/")[2];
var username;
$(document).ready(function () {
    socket = io();
    socket.emit("join", roomID);
    username = document.getElementById("username").value;
    socket.emit("chat", {
        roomID,
        message: username + " has joined"
    });
});
$(function () {
    $("form").submit(function (e) {
        e.preventDefault(); // prevents page reloading
        socket.emit("chat", {
            roomID,
            message: username + ": " + $("#userMessage").val(),
        });
        $("#userMessage").val("");
        return false;
    });
    socket.on("chat", function (msg) {
        if (msg.substr(0, 22) === "data:image/png;base64,") {
            $("#messages").append($("<li>").html($("<img>").attr("src", msg)));
            $("#messages").animate({scrollTop: $("#messages")[0].scrollHeight}, 1);
        } else {
            $("#messages").append($("<li>").text(msg));
            $("#messages").animate({scrollTop: $("#messages")[0].scrollHeight}, 1);
        }
    });
});