const logout = function( e ) {
    e.preventDefault();

    console.log("logging")

    fetch('/logout', {
        method:'POST'
    })
    .then( () => {
        window.location.href="/";
    })

    return false;
}

window.addEventListener('load', () => {
    console.log("logout.js loaded");
    const logoutButton = document.querySelector('#logoutButton');
    logoutButton.onclick = logout;
});

