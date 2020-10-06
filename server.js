const express = require("express");
const dotenv = require("dotenv").config({path: './config.env'});
const connectDb = require("./config/db");
const morgan = require("morgan");
const app = express();

// morgan logging
app.use(morgan("dev"));

app.use(express.static("public"));

connectDb(process.env.MONGO_URI)


// routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/views/home.html");
})

app.listen(process.env.PORT, () => {
    console.log("Server is listening on port: ", process.env.PORT);
});
