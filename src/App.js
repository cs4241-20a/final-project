import React from 'react';
import './App.css';
import Home from './Pages/Home';
import Lobby from './Pages/Lobby';
import Login from './Pages/Login';
import Register from './Pages/Register'
import { BrowserRouter as Router, Switch, Link, Route } from "react-router";
function App() {
  return (
    <div className="App">
      <Router>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </nav>
      </Router>
      <Switch>
        <Route path="/">
          <Home />
        </Route>
        <Route path="/lobby">
          <Lobby />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
