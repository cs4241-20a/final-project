import React, { Component } from 'react';

  class PlayerGrid extends Component {
    render(){
      let letters = ["A","B","C","D","E","F","G","H","I","J"]
      let i , j;
      let grid = []
      for(i = 0; i < 10; i ++){
        for(j = 1; j <=10; j++)
        {
          let id = 'P1[' + letters[i] + ',' + j + ']';
          grid.push(<button className="item" key={id} id={id} onClick={(e) => {
            console.log("Sicko mode")
            console.log(e.target.id)
          }}></button>);
        }
      }
      return (<div className="board">{grid}</div>)
    }
}

export default PlayerGrid;