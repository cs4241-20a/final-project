function joinGame() {
    window.location.replace('/game');
}

window.onload = () => {
    fetch("/topScores", {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
    })
        .then((res) => res.json()).then(json => console.log(json))
}
