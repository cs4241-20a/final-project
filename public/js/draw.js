var path;

var text = new PointText(new Point(10,25));
text.fontSize = "20px";
text.fillColor = 'black';

var content = "";

function onMouseDown(event) {
	// Create a new path and set its stroke color to black:
	path = new Path({
		segments: [event.point],
		strokeCap: 'round',
		strokeColor: document.getElementsByClassName("color selected")[0].id,
		strokeWidth: document.getElementsByClassName("brush selected")[0].id
    });
}

// While the user drags the mouse, points are added to the path
// at the position of the mouse:
function onMouseDrag(event) {
	path.add(event.point);
}

// When the mouse is released, we simplify the path:
function onMouseUp(event) {
    //path.smooth();
	path.simplify(2);
}

function onKeyDown(event) {
	if (event.key === "backspace" && content.length > 0) {
		content = content.slice(0, -1);
	} else {
		content += event.character;
	}
	text.content = content;
}

document.getElementById("clear").addEventListener('click', function(e) {
	project.clear();
	text = new PointText(new Point(10,25));
	text.fontSize = "20px";
	text.fillColor = 'black';
	content = "";
});