import React, { Component } from "react";
import "./css/Lobby.css";
import Button from "react-bootstrap/Button";
import BattleShip from "./BattleShip";

export class Lobby extends Component {
  render() {
    return (
      <div>
        <h1>Lobby</h1>
        <BattleShip socket={this.props.socket}/>
        <p id="code">Join Code : ????</p>
        <div className="room">
          <p id="player1">You(username)</p>
          <p id="vs">VS</p>
          <p id="player2">Waiting for player...</p>
          <Button variant="primary" id="startbtn">Start Game</Button>{""}
        </div>
      </div>
    );
  }
}

export default Lobby;
