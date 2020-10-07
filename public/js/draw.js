var path;

function onMouseDown(event) {
	// Create a new path and set its stroke color to black:
	path = new Path({
		segments: [event.point],
		strokeColor: document.getElementsByClassName("selected")[0].id
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
	path.simplify(5);
}