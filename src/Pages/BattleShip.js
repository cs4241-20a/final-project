import React, { Component } from "react";
import "./css/BattleShip.css";
import EnemyGrid from "../Components/EnermyGrid";
import PlayerGrid from "../Components/PlayerGrid";

export class BattleShip extends Component {
  render() {
    let socket = this.props.socket
    socket.on("message", (data) => {
      console.log(data)
    })
    return (
      <div>
        <h1>BattleShip</h1>
        <div>
          <EnemyGrid />
          <PlayerGrid />
        </div>
        <p>chat system here!</p>
      </div>
    );
  }
}

export default BattleShip;
