import React from 'react';
import './App.css';
import Home from './Pages/Home';
import Lobby from './Pages/Lobby';
import Login from './Pages/Login';
import Register from './Pages/Register' 
import io from "socket.io-client"
import { BrowserRouter as Router, Switch, Link, Route } from "react-router-dom";
function App() {
  let count = 0
  const socket = io("ws://localhost:3000")
  socket.on('connect', () => {
    socket.send("Hello beter")
  })

  socket.on("message", data => {
    console.log(data)
  })  

  const joinLobby = () => {
    socket.emit('joinNextLobby')
  }

  const sendClick = () => {
    socket.emit("chat", "Dorito")
  }

  return (
    <div className="App">
      <Router>
        <nav>
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
          <button onClick={joinLobby}>Button</button>
          <button onClick={sendClick}>Send Click</button>
        </nav>
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
         <Route path="/">
          <Home />
        </Route>
      </Switch>
      </Router>
    </div>
  );
}

export default App;
