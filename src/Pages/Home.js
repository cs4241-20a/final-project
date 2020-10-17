import React, { Component } from "react";
import "./css/Home.css";

export class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: props.socket,
    };
    this.state.socket.on("message", (data) => {
      console.log(data);
    });
  }
  render() {
    return (
      <div>
        <h1>Home</h1>
        <p>
          <button type="submit" action="/logout" method="POST">
            Log Out
          </button>
        </p>

        <div className="room">
          <h2>Play BattleShip</h2>
          <form>
            <label for="newcode">Put in your passcode</label>
            <input 
              type="text" 
              maxLength="4" 
              placeholder="Secret Passcode Shhhh"
              id="newcode"
              name="newcode"
              />
            <button
              id="hostbtn"
              onClick={(e) => {
                e.preventDefault()
                console.log(document.getElementById("newcode").value)
                this.state.socket.emit("createLobby", document.getElementById("newcode").value);
              }}
            >
              Create a Lobby
            </button>
          </form>
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
