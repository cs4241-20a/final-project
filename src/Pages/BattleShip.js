import React, { Component } from 'react';
import './css/BattleShip.css';
import EnermyGrid from '../Components/EnermyGrid';
import PlayerGrid from '../Components/PlayerGrid';

export class BattleShip extends Component {
    render() {
        return (
            <div>
    <h1>BattleShip</h1>
    <p>chat system here!</p>
        <div>
          <PlayerGrid />
          <EnermyGrid />
        </div>
            
          </div>
        )
    }
}

export default BattleShip
