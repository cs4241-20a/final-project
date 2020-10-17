// A simple express server for storing settings data
require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const { json } = require("body-parser");
const serveStatic = require("serve-static");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const header = { "Content-Type": "application/json" };
const ObjectId = require("mongodb").ObjectId;
const MongoClient = require("mongodb").MongoClient;
const bcrypt = require("bcrypt");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const mongoUri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@battleship.xvhzl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect().catch(err => console.log(err));
app.set("trust proxy", 1);
app.use(bodyParser.urlencoded({ extended: true }));


const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
let lobbies = {}

const uidGenerator = () => {
  let S4 = () => {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }
  return ("_" + S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4())
}
const addUserToRandomLobby = () => {
  let lobbyKeys = Object.keys(lobbies)
  let lobbyId = null
  lobbyKeys.forEach((key) => {
    if(lobbies[key]){
      console.log(lobbies[key])
      if(lobbies[key].client1 == null || lobbies[key].client2 == null){
        //Only once please
        if(!lobbyId){
          lobbyId = key
        }
      }
      else {
        //Do nothing lobby full
      }
    }
  })
  return lobbyId
}



const initBattleShipBoard = (
  destroyer,
  // submarine,
  // cruiser,
  // battleship,
  // carrier
) => {
  const getLetterIndex = (letter) => letters.indexOf(letter)

  const getPositionArray = (start, end, length) => {
    let posArray = []
    if(start.charAt(0) === end.charAt(0)){
      //rowwise
      if(((start.charAt(1) - 1 ) <= 10 )  && start.charAt(1) >= 1){
        for(let i=0; i<length;i++){
          posArray.push({
            position: `${start.charAt(0)}${+start.charAt(1) + i}`,
            hit: false
          })
        }
      }
      else {
        console.log("Out of bounds row")
      }
    }
    else if(start.charAt(1) === end.charAt(1)){
      //Colwise
      let baseLetterIndex = getLetterIndex(start.charAt(0))
      //otherwise too big
      if((baseLetterIndex + length) <= 10){
        for(let i=0; i < length; i++){
          posArray.push({
            position: `${letters[baseLetterIndex + i]}${start.charAt(1)}`,
            hit: false
          })
        }
      }
      else {
        console.log("Out of bounds col")
      }
    }
    else {
      //Bad Placement
    }
    return posArray
  }

  console.log(getPositionArray(destroyer.start, destroyer.end, 5))
}


io.on("connect", socket => {
  //Take advantage of closure?
  let lobbyId = null;

  socket.send(`Hello joe #${socket.id}`)
  // initBattleShipBoard({
  //   start: "F3",
  //   end: "J3"
  // })

  socket.on("joinNextLobby", () => {
    let newLobbyId = addUserToRandomLobby()
    if(newLobbyId){
      if(lobbies[newLobbyId].client1 === null){
        lobbies[newLobbyId].client1 = {
          id: socket.id,
          name: "Beter",
          board: {}
        }
        lobbyId = newLobbyId
      }
      else if(lobbies[newLobbyId].client2 === null){
        lobbies[newLobbyId].client2 = {
          id: socket.id,
          name: "Joe",
          board: {}
        }
        lobbyId = newLobbyId
        socket.join(newLobbyId)
      }
      else {
        //How?
      }
    }
    else {
      //Lets make a new lobby
      let generatedLobbyid = uidGenerator()
      socket.join(generatedLobbyid)
      lobbies[generatedLobbyid] = {
        client1: {
          id: socket.id,
          name: `Jeff${socket.id}`,
          board: {}
        },
        client2: null,
        messages: []
      }
      lobbyId = generatedLobbyid
    }
  })

  // socket.on("joinSpecificLobby", (lobbyCode) => {
  //   socket.join(lobbyCode)
  //   let desiredLobby = lobbies[lobbyCode]
  //   if(lobbies[lobbyCode]){

  //   }
  // })

  socket.on("leaveLobby", () => {
    socket.leave(lobbyId)
    if(lobbies[lobbyId].client1 && lobbies[lobbyId].client1.id === socket.id){
      lobbies[lobbyId].client1 = null
    }
    else if(lobbies[lobbyId].client2 && lobbies[lobbyId].client2.id === socket.id){
      lobbies[lobbyId].client2 = null
    }
    else {
      //Well guess we weren't in one anyway
    }
    //Delete an empty lobby
    if(lobbies[lobbyId].client1 === null && lobbies[lobbyId].client2 === null ){
      delete lobbies[lobbyId]
    }
    lobbyId = null
  })

  socket.on("disconnecting", () => {
    console.log(socket.rooms)
    socket.leave(lobbyId)
    if(lobbies[lobbyId]){
      if(lobbies[lobbyId].client1 && lobbies[lobbyId].client1.id === socket.id){
        lobbies[lobbyId].client1 = null
      }
      else if(lobbies[lobbyId].client2 && lobbies[lobbyId].client2.id === socket.id){
        lobbies[lobbyId].client2 = null
      }
      else {
        //Well guess we weren't in one anyway
      }
      //Delete an empty lobby
      if(lobbies[lobbyId].client1 === null && lobbies[lobbyId].client2 === null ){
        delete lobbies[lobbyId]
        console.log(socket.rooms)
        delete socket.rooms[lobbyId]
        console.log(socket.rooms)
      }
      lobbyId = null
    }
    else {
      delete socket.rooms[socket.id]
      console.log(socket.rooms)
    }
  })

  socket.on("chat", (message) => {
    console.log("CHatting", message)
    console.log(lobbies)
    socket.to(lobbyId).send(message)
  })
})

const userRegistration = (username, password) => {
  return new Promise((resolve, reject) => {
    console.log(username, password);
    if (!username || !password) {
      resolve({
        error: "Missing Fields",
      });
    }
    const collection = client
      .db(process.env.DB_NAME)
      .collection(process.env.DB_COLLECTION);
    collection
      .findOne({ username: username })
      .then((result) => {
        if (!!result) {
          
          resolve({
            error: "User Exists",
          });
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            if (err) {
              console.log(err);
              reject({
                error: "Salt Error",
              });
            } else {
              bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                  console.log(err);
                  reject({
                    error: "Encryption Error",
                  });
                } else {
                  const user = {
                    username,
                    password: hash,
                  };

                  collection
                    .insertOne(user)
                    .then((result) => {
                      console.log("Insert");
                      console.log(result.ops[0]);
                      resolve(result.ops[0]);
                    })
                    .catch((err) => {
                      console.log(err);
                      reject({
                        error: "Could Not Add User",
                      });
                    });
                }
              });
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
        reject({
          error: "Issue with MongoDB",
          systemError: err,
        });
      });
  });
};

const userLogin = (username, password) => {
  return new Promise((resolve, reject) => {
    if (!username || !password) {
      resolve({
        error: "Missing Fields",
      });
    } else {
      const collection = client
        .db(process.env.DB_NAME)
        .collection(process.env.DB_COLLECTION);
      collection
        .findOne({ username: username })
        .then((result) => {
          if (!result) {
            //stay on login page for error
            resolve({
              error: "No User Exists",
            });
          } else {
            bcrypt
              .compare(password, result.password)
              .then((loggedIn) => {
                resolve(result);
              })
              .catch((err) => {
                resolve({
                  error: "Incorrect Password",
                });
              });
          }
        })
        .catch((err) => {
          console.log(err);
          reject({
            error: "Issue with the DB Query",
          });
        });
    }
  });
};

app.use(
  session({
    secret: "bionicle",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser((userId, done) => {
  client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COLLECTION)
    .findOne({ _id: ObjectId(userId) })
    .then((user) => {
      if (!!user) {
        done(null, user);
      } else {
        done({ error: "User Not Found" }, null);
      }
    })
    .catch((err) => {
      console.log(err);
      done(err, false);
    });
});

passport.use(
  "local-registration",
  new LocalStrategy({ session: true }, function (username, password, done) {
    userRegistration(username, password)
      .then((result) => {
        if (result.error) {
          done(
            {
              error: result.error,
            },
            null
          );
        } else {
          done(null, result);
        }
      })
      .catch((err) => {
        console.log(err);
        done(
          {
            error: "Server Issue",
            systemError: err,
          },
          null
        );
      });
  })
);

passport.use(
  "local-login",
  new LocalStrategy({ session: true }, function (username, password, done) {
    userLogin(username, password)
      .then((result) => {
        if (result.error) {
          done(
            {
              error: result.error,
            },
            null
          );
        } else {
          done(null, result);
        }
      })
      .catch((err) => {
        console.log("DB Issue");
        console.log(err);
        done(
          {
            error: "Issue with Mongo",
            systemError: err.error,
          },
          null
        );
      });
  })
);

app.post("/login", function (req, res, next) {
  if (!req.body.password || !req.body.username) {
    res.writeHead(400, { header });
    res.end(
      JSON.stringify({
        errorMessage: "Invalid Registration",
        error: "Missing Fields",
        errorCode: 400,
      })
    );
  } else {
    passport.authenticate(
      "local-login",
      {
        session: true,
      },
      function (err, user, info) {
        if (err) {
          if (err.systemError) {
            res.writeHead(500, { header });
            res.end(
              JSON.stringify({
                errorMessage: "There was an issue with the server",
                error: err.systemError,
                errorCode: 500,
              })
            );
          } else {
            res.writeHead(400, { header });
            res.end(
              JSON.stringify({
                errorMessage: "Invalid Login",
                error: err.error,
                errorCode: 400,
              })
            );
          }
        } else {
          req.login(user, function (err) {
            if (err) {
              console.log(err);
              res.writeHead(500);
              res.end(
                JSON.stringify({
                  errorMessage: "Session Issue",
                  error: err,
                  errorCode: 500,
                })
              );
            }
            res.redirect("/")
            res.end(JSON.stringify({ Success: "YeetLogin" }));
          });
        }
      }
    )(req, res, next);
  }
});

app.post("/register", (req, res, next) => {
    if (!req.body.password || !req.body.username) {
      res.writeHead(400, { header });
      res.end(
        JSON.stringify({
          errorMessage: "Invalid Registration",
          error: "Missing Fields",
          errorCode: 400,
        })
      );
    } else {
      passport.authenticate(
        "local-registration",
        {
          session: true,
        },
        function (err, user, info) {
          if (err) {
            if (err.systemError) {
              res.writeHead(500, { header });
              res.end(
                JSON.stringify({
                  errorMessage: "There was an issue with the server",
                  error: err.systemError,
                  errorCode: 500,
                })
              );
            } else {
              res.writeHead(400, { header });
              res.end(
                JSON.stringify({
                  errorMessage: "Invalid Registration",
                  error: err.error,
                  errorCode: 400,
                })
              );
            }
          } else {
            req.login(user, function (err) {
              if (err) {
                console.log(err);
                res.writeHead(500);
                res.end(
                  JSON.stringify({
                    errorMessage: "Session Issue",
                    error: err,
                    errorCode: 500,
                  })
                );
              }
              res.writeHead(200);
              res.end(JSON.stringify({ Success: "YeetLogin" }));
            });
          }
        }
      )(req, res, next);
    }
  });
  
app.post("/logout", (req, res) => {
    req.logout();
    res.redirect("/login")
    res.writeHead(200);
    res.end(JSON.stringify({ Success: "Logout" }));
  });

app.get("/authStatus", (req, res) => {
  if(req.user){
    console.log(`Auth passed: ${req.user}`)
    res.writeHead(200)
    res.end(JSON.stringify({
      loggedIn: true,
      user: req.user
    }))
  }
  else {
    res.writeHead(200)
    res.end(JSON.stringify({
      loggedIn: false,
      user: null
    }))
  }
})
//Serving the React App
app.use(
  serveStatic(path.join(__dirname, "build"), {
    index: "index.html",
    extensions: ["html"],
  })
);

//Catching all urls to point to the react app to be caught by the react router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

//listen to port
http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
