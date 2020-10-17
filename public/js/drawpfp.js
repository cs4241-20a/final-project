const canvas = document.getElementById('profileCanvas')
const ctx = canvas.getContext('2d')
ctx.canvas.width = 300
ctx.canvas.height = 300
ctx.lineWidth = 10
ctx.imageSmoothingEnabled = true;
const DEFAULTCOLOR = '#111111'
const maxColors = 9
ctx.strokeStyle = "black"
let pCoords
//stop controls if the brush is actively drawing or not
let stop = true
//inFrame controls if the mouse can actively change the canvas
let inFrame = false


//timer variables
let timerStarted = false
let drawingTimeLimit = 20
let drawingTimeout




class point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class stroke {
    constructor(brushColor, brushSize) {
        this.brushColor = brushColor
        this.brushSize = brushSize
        this.points = []
    }

    appendPoint(point) {
        this.points.push(point);
    }

    changeColor(color) {
        this.brushColor = color
    }

    changeSize(brushSize) {
        this.brushSize = brushSize
    }
}

class drawing {
    constructor() {
        this.strokes = []
    }

    appendStroke(stroke) {
        this.strokes.push(stroke);
    }
}

let picture = new drawing()
let currentStroke = new stroke(ctx.strokeStyle, ctx.lineWidth)

//mouse over/out
canvas.addEventListener('mouseover', (event => {
    ctx.beginPath()
    stop = true
    pCoords = trueCoordinates(event)
}))

canvas.addEventListener('mouseout', (event => {
    stop = true
    inFrame = false
    if (currentStroke.points.length > 0) {
        picture.appendStroke(currentStroke)
        currentStroke = new stroke(ctx.strokeStyle, ctx.lineWidth)
        console.log(picture)
    }
}))

canvas.addEventListener('click', (event => {
    if (!timerStarted) {

        //start timer
        drawingTimeout = setInterval(timer, 1000)
        timerStarted = true

        //disable closing window after starting a drawing
        document.querySelector('#closeDrawingWindow').disabled = true
    }

    else if (inFrame) {
        pCoords = trueCoordinates(event)
        // let pointStroke = new stroke(ctx.strokeStyle, ctx.lineWidth)
        // pointStroke.appendPoint(pCoords)
        // picture.appendStroke(pointStroke)
        draw(pCoords.x, pCoords.y)
        ctx.beginPath()
    }
}))


canvas.addEventListener('mousedown', (event => {
    stop = false
    inFrame = true
    currentStroke = new stroke(ctx.strokeStyle, ctx.lineWidth)
    pCoords = trueCoordinates(event)
}))

canvas.addEventListener('mousemove', (event => {
    if (!stop) {
        pCoords = trueCoordinates(event)
        currentStroke.appendPoint(pCoords)
        draw(pCoords.x, pCoords.y)
    }
}))

canvas.addEventListener('mouseup', (event => {
    ctx.beginPath()
    stop = true
    if (currentStroke.points.length > 0) {
        picture.appendStroke(currentStroke)
        currentStroke = new stroke(ctx.strokeStyle, ctx.lineWidth)
        console.log(picture)
    }
}))


function trueCoordinates(event) {
    let rect = canvas.getBoundingClientRect()
    let x = event.clientX - rect.x
    let y = event.clientY - rect.y
    return new point(x, y)
}

function draw(x, y) {
    ctx.lineCap = 'round';
    //ctx.bezierCurveTo(pCoords2.xLoc, pCoords2.yLoc, pCoords.xLoc, pCoords.yLoc,x,y)
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
}

//get all color buttons
color_buttons = document.querySelectorAll('[id^=color_]')
//add stroke style to each button
color_buttons.forEach(button => button.addEventListener('click', () => {
    ctx.strokeStyle = button.id.split('_')[1]
}))



//set pen size
document.querySelector('#penSize').addEventListener('input', (event) => {
    ctx.lineWidth = event.target.value
})


//close drawing window and clear canvas
document.querySelector('#closeDrawingWindow').addEventListener('click', () => {
    ctx.fillStyle = DEFAULTCOLOR
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
})


let timeRemaining = drawingTimeLimit

function timer() {
    if (timeRemaining > 0) {
        timeRemaining--
        //update timer element
        document.querySelector('#drawingTimer').innerHTML = `${timeRemaining}s`
    } else {

        //upload drawing to server here
        let dataURL= canvas.toDataURL('image/png')
        console.log(picture)

        fetch("/pfp", {
            method:"POST",
            body:JSON.stringify(
                {
                    avatar: dataURL
                }
            ),
            headers: { "Content-Type": "application/json"}
        }).then(response => response.json())
          .then(json => {
            console.log("response from server : ", json)
            document.getElementById('userAvatar').src = json.avatar
        })


        //reset globals
        stop = true;
        picture = new drawing()
        timerStarted = false
        timeRemaining = drawingTimeLimit

        //clear setTimeout
        clearTimeout(drawingTimeout)



        //clear timer
        document.querySelector('#drawingTimer').innerText = ''

        //enable the close button
        document.querySelector('#closeDrawingWindow').disabled = false

        //trigger close button
        document.querySelector('#closeDrawingWindow').click()

    }
}