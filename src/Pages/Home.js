import React, { Component } from "react";
import "./css/Home.css";
import Button from "react-bootstrap/Button";

export class Home extends Component {
  render() {
    return (
      <div>
        <h1>Home</h1>
        <p>
          <button type="submit" action="/logout" method="POST">Log Out</button>
        </p>

        <div class="room">
          <h2>Play BattleShip</h2>
          <button id="hostbtn">Create a Lobby</button>
          <button id="joinrandbtn">Join Random Lobby</button>
          <button id="joincodebtn">Join Private Lobby</button>
          <form>
            <label>Lobby Join Code: </label>
            <input
              type="text"
              maxlength="4"
              id="joincode"
              name="joincode"
              pattern="\d{4}"
              placeholder=" Type join code here"
              required
            ></input>
          </form>
        </div>
      </div>
    );
  }
}

export default Home;
