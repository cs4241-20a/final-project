import React, { Component } from "react";

export class Demo extends Component {
  test = () => {
    alert("click");
  };
  render() {
    return (
      <div>
        <button onClick={this.test}>Test</button>
      </div>
    );
  }
}

export default Demo;
