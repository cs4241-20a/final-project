const logout = function( e ) {

    fetch('/logout', {
        method:'POST'
    })

    return false;
}

window.onload = function() {
    const logoutButton = document.querySelector('#logoutButton');
    logoutButton.onclick = logout;
}

