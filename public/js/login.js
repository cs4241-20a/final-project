const ghlogin = function( e ) {
    e.preventDefault();

    fetch('/getghurl', {
        method:'GET'
    })
    .then( response => response.json() )
    .then( url => {
        window.location.href=url
    })

    return false;
}

window.onload = function() {
    const ghloginbutton = document.querySelector('#ghlogin');
    ghloginbutton.onclick = ghlogin;
}

