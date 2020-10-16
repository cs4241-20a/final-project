import React, { Component } from 'react'
import './css/Login.css'

export class Login extends Component {
    render() {
        return (
            <div>
<h1>Login</h1>
  <p id="errormsg"></p>
    <form action="/login" method="POST">
      <div class="center">
          <label for="name" >Username: </label>
        <input type="text" id="name" name="name" placeholder="username here" required></input>
      </div>
      <div class="center">
          <label for="password" >Password: </label>
        <input type="password" id="password" name="password" placeholder="password here" required></input>
      </div>
      <div class= "center">
      <button type="submit">Login</button>
      </div>
  </form>
<a class="center" href="/register">Click here to register</a>
            </div>
        )
    }
}

export default Login
