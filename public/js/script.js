"use strict";

function colorClick(e) {
    document.getElementsByClassName("selected")[0].className = "color";
    e.target.className = "color selected";
}

function getImage(e) {
    document.getElementById("centralCanvas").toBlob(function(blob) {
        console.log(blob);
    });
}

window.onload = function(e) {
    let buttons = document.getElementsByClassName("color");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', colorClick);
    }

    document.getElementById("save").addEventListener('click', getImage);
}

console.log("JS Loaded");