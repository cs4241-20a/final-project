import React, { Component } from 'react'
// import './css/register.css'

export class Register extends Component {
  render() {
    return (
      <body>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" />
        <div class="full-screen-container">
          <div class="login-container">
            <h3 class="login-title">Register an Account</h3>
            <form action="/register" method="POST">
              <div class="input-group">
                <label>Username</label>
                <input type="text" id="username" name="username" placeholder="username here" required/>
              </div>

              <div class="input-group">
                <label>Password</label>
                <input type="password" id="password" name="password" placeholder="password here" required/>
              </div>

              <div class="input-group">
                <label>Confirm Password</label>
                <input type="password" id="confirmPass" name="confirmPass" placeholder="confirm password here" required/>
              </div>

              <button type="submit" class="login-button">Register</button>
            </form>
            <div class="container-footer">
              <a href="/login">Click here to Login</a>
            </div>
          </div>
        </div>
      </body>
    )
  }
}

export default Register
