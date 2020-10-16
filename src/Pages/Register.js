import React, { Component } from 'react'
import './css/Login.css'

export class Register extends Component {
    render() {
        return (
            <div>
    <h1>Register</h1>
      <form action="/register" method="POST">
        <div class="center">
            <label for="name">Username: </label>
          <input type="text" id="name" name="name" placeholder="username here" required></input>
        </div>
        <div class="center">
            <label for="password">Password: </label>
          <input type="password" id="password" name="password" placeholder="password here" required></input>
        </div>
        <div class="center">
            <button type="submit">Register</button>
        </div>
      </form>
    <a class="center" href="/login">Click here to login</a>
            </div>
        )
    }
}

export default Register
