import React, { Component } from 'react'
import './css/Login.css'

export class Register extends Component {
  render() {
    return (
      <main>
        <div className="full-screen-container2">
          <div className="login-container">
            <h3 className="login-title">Register an Account</h3>
            <form action="/register" method="POST">
              <div className="input-group">
                <label>Username</label>
                <input type="text" id="username" name="username" placeholder="username here" required/>
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" id="password" name="password" placeholder="password here" required/>
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <input type="password" id="confirmPass" name="confirmPass" placeholder="confirm password here" required/>
              </div>

              <button type="submit" className="login-button">Register</button>
            </form>
            <div className="container-footer">
              <a href="/login">Click here to Login</a>
            </div>
          </div>
        </div>
      </main>
    )
  }
}

export default Register