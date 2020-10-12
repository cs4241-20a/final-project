function joinGame() {
    window.location.replace('/game');
}

window.onload = () => {
    // init elements
    let leaderBoardlist = document.getElementById("leaders-container")

    // get leaders
    fetch("/topScores", {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
    })
        .then((res) => res.json()).then(leaders => {
        leaders.forEach((user) => {
            if (user.username && user.score) {
                let listItem = document.createElement("li");
                listItem.textContent = `${user.username} - ${user.score}`;

                leaderBoardlist.appendChild(listItem);
            }
        })
    })
}
