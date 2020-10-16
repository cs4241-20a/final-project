import React, { Component } from 'react'
import './css/Lobby.css'

export class Lobby extends Component {
    render() {
        return (
            <div>
    <h1>Lobby</h1>
    <p id = "code">Join Code : ????</p>
    <div class = "room">
      <p id = "player1">You(username)</p>
      <p id = "vs">VS</p>
      <p id = "player2">Waiting for player...</p>
      <button id = "startbtn">Start Game</button>
    </div>
            </div>
        )
    }
}

export default Lobby
