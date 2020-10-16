import React, { Component } from 'react'
import './css/Home.css'

export class Home extends Component {
    render() {
        return (
            <div>
    <h1>Home</h1>
    <p><button>Log In</button>  |  <button>Register</button></p>
    <p><button>Friend List</button></p>
    <div class = "room">
      <h2>Play BattleShip</h2>
      <button id = "hostbtn">Create a Lobby</button>
      <button id = "joinrandbtn">Join Random Lobby</button>
      <button id = "joincodebtn">Join Lobby with Code</button>
      <form>
        <label>Lobby Join Code:</label>
        <input type="text" maxlength="4" id="joincode" name="joincode" pattern="\d{4}" placeholder="join code here" required></input>
      </form>
    </div>
            </div>
        )
    }
}

export default Home
