const logout = function( e ) {
    e.preventDefault();

    fetch('/logout', {
        method:'POST'
    })
    .then( () => {
        window.location.href="/";
    })

    return false;
}

window.onload = function() {
    const logoutButton = document.querySelector('#logoutButton');
    logoutButton.onclick = logout;
}

