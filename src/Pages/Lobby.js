import React, { Component } from "react";
import "./css/Lobby.css";
import Chat from "../Components/Chat";

export class Lobby extends Component {
  render() {
    return (
      <div>
        <h1>Lobby</h1>
        <Chat socket={this.props.socket}/>
        {/* <p id="code">Join Code : ????</p>
        <div className="room">
          <p id="player1">You(username)</p>
          <p id="vs">VS</p>
          <p id="player2">Waiting for player...</p>
          <Button variant="primary" id="startbtn">Start Game</Button>{""} 
        </div>*/}
      </div>
    );
  }
}

export default Lobby;
