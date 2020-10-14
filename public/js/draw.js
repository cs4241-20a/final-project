const { default: fetch } = require("node-fetch");

var path;

var text = new PointText(new Point(4, 20));
text.fontSize = "20px";
text.fillColor = "black";

var content = document.getElementById("username").value;
text.content = content;


function clearCanvas(e) {
    project.clear();
    text = new PointText(new Point(4, 20));
    text.fontSize = "20px";
    text.fillColor = "black";
    //content = document.getElementById("username").value;
    text.content = content;
}

function onMouseDown(event) {
    // Create a new path and set its stroke color to black:
    path = new Path({
        segments: [event.point],
        strokeCap: "round",
        strokeColor: document.getElementsByClassName("color selected")[0].id,
        strokeWidth: document.getElementsByClassName("brush selected")[0].id,
    });
}

// While the user drags the mouse, points are added to the path
// at the position of the mouse:
function onMouseDrag(event) {
    path.add(event.point);
    text.bringToFront();
}

// When the mouse is released, we simplify the path:
function onMouseUp(event) {
    //path.smooth();
    path.simplify(2);
    text.bringToFront();
}

// function onKeyDown(event) {
//     if (event.key === "backspace" && content.length > 0) {
//         content = content.slice(0, -1);
//     } else {
//         content += event.character;
//     }
//     text.content = content;
// }

document.getElementById("clear").addEventListener("click", clearCanvas);

window.addEventListener('load', () => {
    console.log('thing');
    await fetch('/chatroom/username', {
        method: 'GET',
        headers: {'Content-Type' : 'application/json' },
    })
    .then( response => response.json())
    .then( response => {
        text.content = response;
    })
    console.log("uwu" + text.content);
});
