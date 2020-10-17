import React, { Component } from "react";
import "./css/Home.css";

export class Home extends Component {
  render() {
    return (
      <div>
        <h1>Home</h1>
        <p>
          <button onClick="/logout" method="POST" to="/login">Log Out</button>
        </p>

        <div className="room">
          <h2>Party Chat</h2>
          <button id="hostbtn">Create a Lobby</button>
          <button id="joinrandbtn">Join Random Lobby</button>
          <button id="joincodebtn">Join Private Lobby</button>
          <form>
            <label>Lobby Join Code: </label>
            <input
              type="text"
              maxLength="4"
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
