const login = function(e) {
  e.preventDefault();

  fetch("/login", {
    method: "GET"
  })
    .then(response => response.json())
    .then(url => {
      window.location.href = url;
    });

  return false;
};

const goToAbout = function(e) {
  e.preventDefault();

  fetch("/goToAbout", {
    method: "GET"
  }).then(url => {
    window.location.href = "/about";
  });

  return false;
};

window.onload = function() {
  const button = document.querySelector("#loginButton");
  button.onclick = login;

  const aboutButton = document.querySelector("#aboutButton");
  aboutButton.onclick = goToAbout;
};
