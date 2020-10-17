import React, { Component } from 'react'
import "./css/Login.css"

export class Login extends Component {
  render() {
    return (
      <body>
        <div class="full-screen-container">
          <div class="login-container">
            <h3 class="login-title">Sign into your Account</h3>
            <form action="/login" method="POST">
              <div class="input-group">
                <label>Username</label>
                <input type="text" id="username" name="username" placeholder="username here" required/>
              </div>

              <div class="input-group">
                <label>Password</label>
                <input type="password" id="password" name="password" placeholder="password here" required/>
              </div>

              <button type="submit" class="login-button">Log In</button>
            </form>
            <div class="container-footer">
              <a href="/register">Click here to Register</a>
            </div>
          </div>
        </div>
      </body>
    )
  }
}
export default Login