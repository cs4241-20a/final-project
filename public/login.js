let userNameInput;
let passwordInput;
let logInButton;
let signUpButton;
let form;
let errorMessage;

function getLoginPasswordData() {
    let username = userNameInput.value;
    let password = passwordInput.value;

    return {username: username, password: password}
}

function setErrorMessage(message) {
    errorMessage.innerText = message;
}

function handleSignUpOrLogin() {
    // clear error message
    setErrorMessage("");

    let data = getLoginPasswordData();

    let route = "/auth/signin";

    if (data.username.length && data.password.length) {
        // make the api request to create new user
        fetch(route, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
            .then((res) => {
                console.log(res);
                if (res.status === 401) {
                    try {
                        res.json().then((jsonRes) => {
                            setErrorMessage(jsonRes.message);
                        })
                    } catch (e) {
                        setErrorMessage("Something went wrong");
                    }
                } else {
                    localStorage.setItem("nickname", data.username);
                    console.log('Did not get 401');
                    window.location.replace("/");
                }
            })
    } else {
        // user didn't enter password / username
        setErrorMessage("Do not forget to specify username / password!");
    }
}

window.onload = () => {
    userNameInput = document.getElementById("username");
    passwordInput = document.getElementById("password");
    logInButton = document.getElementById("log-in");
    signUpButton = document.getElementById("sign-up");
    errorMessage = document.getElementById("error-message");

    // prevent default form submit
    form = document.getElementById("the-form");
    form.addEventListener('submit', (e) => {
        e.preventDefault();
    })
}
