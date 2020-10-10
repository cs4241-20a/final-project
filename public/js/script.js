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
    document.getElementById("centralCanvas").toBlob(function (blob) {
        console.log(blob);
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
