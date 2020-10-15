const express = require("express");
const app = express();

app.use(express.static("public"));

//include multipage viewing - sadie
app.use(express.static(__dirname + '/views'));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
