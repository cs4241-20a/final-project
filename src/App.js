import React from "react";
import "./App.css";
import Home from "./Pages/Home";
import Lobby from "./Pages/Lobby";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Switch, Link, Route } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { NavLink } from "react-bootstrap";

function App() {
  const socket = io("ws://localhost:3000")
  return (
    <div className="App">
      <Router>
        <Navbar bg="dark" variant="dark">
          <Nav>
            <Nav.Link to="/" as={Link}>
              Home
            </Nav.Link>
            <NavLink to="/login" as={Link}>
              Login
            </NavLink>
            <NavLink to="/register" as={Link}>
              Register
            </NavLink>
            <NavLink to="/lobby" as={Link}>
             Lobby
            </NavLink>
          </Nav>
        </Navbar>
        <Switch>
          <Route path="/lobby">
            <Lobby socket={socket}/>
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
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
