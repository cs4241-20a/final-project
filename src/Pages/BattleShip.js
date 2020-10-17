import React, { Component } from 'react';
import './css/BattleShip.css';
import EnermyGrid from '../Components/EnermyGrid';
import PlayerGrid from '../Components/PlayerGrid';

export class BattleShip extends Component {
    render() {
        return (
            <div>
    <h1>BattleShip</h1>
        <div>
        <p><strong>Your Fleet</strong></p>
          <PlayerGrid />
          <br />
          <br />
          <br />
          <p><strong>Enemy Fleet</strong></p>
          <EnermyGrid />
        </div>
            
          </div>
        )
    }
}

export default BattleShip
