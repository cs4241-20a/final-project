const login = function( e ) {
    e.preventDefault();

    fetch('/login', {
        method:'GET'
    })
    .then( response => response.json() )
    .then( url => {
        window.location.href=url
    })

    return false;
}


window.onload = function() {
    const button = document.querySelector( '#loginButton' )
    button.onclick = login
}