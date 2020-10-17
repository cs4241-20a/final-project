sessionStorage.clear()

fetch("/mydata")
    .then(response => response.json())
    .then(json => {
        document.getElementById("userFlag").src = json.flag
        document.getElementById("userAvatar").src = json.avatar
        document.getElementById("userHandle").innerText = json.username
        updateFriendsDisplay(json).then()
    })

initReceiverSocket();
console.log("ws is " + ws);

async function updateFriendsDisplay(myData) {

    // Will need to pull data for each friend
    let friends = myData.friends
    let container = document.getElementById("friendsDisplay")
    let rows = []

    for (let i = 0; i < friends.length; i++) {
        if (i % 4 === 0) {
            let newRow = document.createElement("div")
            newRow.classList.add("row")
            rows.push(newRow)
        }

        // Get friend data by username
        let friendData = await getFriendData(friends[i])

        let title = document.createElement("h5")
        title.classList.add("card-title")
        title.classList.add("text-center")
        title.innerText = friendData.username

        let overlay = document.createElement("div")
        overlay.classList.add("card-img-overlay")
        overlay.appendChild(title)

        let avatar = document.createElement("img")
        avatar.src = friendData.avatar
        avatar.classList.add("card-img-bottom")
        avatar.alt = "avatar for " + friendData.username

        let card = document.createElement("div")
        card.classList.add("card")
        card.classList.add("mb-4")
        card.classList.add("box-shadow")
        card.classList.add("bg-dark")
        card.appendChild(avatar)
        card.appendChild(overlay)

        let container = document.createElement("div")
        container.classList.add("col-md-3")
        container.appendChild(card)
        container.onclick = function () {
            console.log("Clicked + " + friendData.username)
            sessionStorage.setItem("friendData",friendData.username)
            document.location.href = "/gallery.html";
        }

        rows[rows.length - 1].appendChild(container) // add to the freshest row

    }

    rows.forEach(row => {
        container.appendChild(row)
    })
}

function getFriendData (friendUsername) {

    // Get friend data by username
    return fetch("/friend", {
        method:"POST",
        body:JSON.stringify({friendUsername:friendUsername}),
        headers: { "Content-Type": "application/json"}
    })
        .then(response => response.json())
        .then(json => {
            return json
        })
}


async function recreate(picture) {
    const canvas = document.getElementById('loadImage')
    const ctx = canvas.getContext('2d')
    ctx.canvas.width = 300
    ctx.canvas.height = 300
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.lineWidth = 10
    ctx.imageSmoothingEnabled = true
    let stroke
    let lineCount = 0
    let currLine = picture.strokes[lineCount]
    let aPoint
    let pointCount = 0

    function draw() {
        if (currLine !== undefined) {
            ctx.lineCap = 'round'
            aPoint = currLine.points[pointCount]
            ctx.lineTo(aPoint.x, aPoint.y)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(aPoint.x, aPoint.y)
            pointCount++
            if (pointCount === currLine.points.length - 1) {
                lineCount++
                pointCount = 0
                currLine = picture.strokes[lineCount]
                ctx.strokeStyle = currLine.brushColor
                ctx.lineWidth = currLine.brushSize
                ctx.beginPath()
            }
            requestAnimationFrame(draw)
        }
    }
    draw()
}
