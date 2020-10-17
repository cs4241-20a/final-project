import React, { Component } from 'react'
import "./css/howtoplay.css"

export class Login extends Component {

  render() {
    return (
      <main>
        <div className="full-screen-container">
          <div className="login-container">
            <h3 className="login-title">Sign into your Account</h3>
            <form action="/login" method="POST">
              <div className="input-group">
                <label>Username</label>
                <input type="text" id="username" name="username" placeholder="username here" required/>
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" id="password" name="password" placeholder="password here" required/>
              </div>

              <button type="submit" className="login-button">Log In</button>
            </form>
            <div className="container-footer">
              <a href="/register">Click here to Register</a>
            </div>
          </div>
        </div>
      </main>
    )
  }
}
export default Login
