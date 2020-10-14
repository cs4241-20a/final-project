// A simple express server for storing settings data
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const { json } = require('body-parser');
const serveStatic = require('serve-static');
const path = require('path');
// app.use(express.static('./'));
app.use(bodyParser.urlencoded({extended: true}));

// //default get method
// app.get('/', (req, res) => {
//     res.sendFile('./views/index.html', { root: __dirname })
// })

//skeleton get method
app.get("/get", (req, res) => {
    console.log("nothing!");
    res.json("something from database");
    res.end();
})

//skeleton post method
app.post("/post", bodyParser.json(), (req, res) => {
    console.log("The nothing is: " + req.body);
    res.end();
})


//Serving the React App
app.use(
    serveStatic(path.join(__dirname, "build"), {
        index: "index.html",
        extensions: ["html"]
    })
)

//Catching all urls to point to the react app to be caught by the react router
app.get("*", (req,res) => {
    res.sendFile(path.join(__dirname, "build/index.html"))
})

//listen to port
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})