import React from "react";
import "./App.css";
import Home from "./Pages/Home";
import Lobby from "./Pages/Lobby";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import BattleShip from "./Pages/BattleShip";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Switch, Link, Route } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { NavLink } from "react-bootstrap";

function App() {
  let count = 0;
  const socket = io("ws://localhost:3000");
  socket.on("connect", () => {
    socket.send("Hello beter");
  });

  socket.on("message", (data) => {
    console.log(data);
  });

  const joinLobby = () => {
    socket.emit("joinNextLobby");
  };

  const sendClick = () => {
    socket.emit("chat", "Dorito");
  };

  return (
    <div className="App">
      <Router>
        <Navbar bg="dark" variant="dark">
          <Nav>
            <Nav.Link>
              <Link to="/">Home</Link>
            </Nav.Link>
            <NavLink>
              <Link to="/login">Login</Link>
            </NavLink>
            <NavLink>
              <Link to="/register">Register</Link>
            </NavLink>
            <NavLink>
              <Link to="/lobby">Lobby</Link>
            </NavLink>
            <NavLink>
              <Link to="/BattleShip">Board (TEMP)</Link>
            </NavLink>
          </Nav>
        </Navbar>
        {/* <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/lobby">Lobby</Link>
            </li>
          </ul>
        </nav> */}
        <Switch>
          <Route path="/lobby">
            <Lobby />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/BattleShip">
            <BattleShip />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
