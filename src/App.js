import React from 'react';
import { Switch, Route } from 'react-router-dom'
import './App.css'
import Home from './home'
import Login from './login'


const App = () => (
  <div className="app-routes">
    <Switch>
      <Route exact={true} path="/" component={Login} />
      <Route exact={true} path="/home" component={Home} />
    </Switch>
  </div>
)

export default App
