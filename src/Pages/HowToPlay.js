import React, { Component } from 'react'
import "./css/howtoplay.css"

export class Login extends Component {

  render() {
    return (
      <body>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous" />
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
