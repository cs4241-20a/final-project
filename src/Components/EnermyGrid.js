import React, { Component } from 'react';

  class EnermyGrid extends React.Component {
  
    render(){
      var i , j;
      let grid = []
      for(i = 1; i <= 10; i ++){
        for(j = 1; j <=10; j++)
        {
          var id = 'P2[' + i + ',' + j + ']';
          grid.push(<button class="item" id = {id}></button>);
        }
      }
      return (<div class="container">{grid}</div>)
    }
    
}

export default EnermyGrid;