import React from 'react';
import './App.css';
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'


// we could place this Todo component in a separate file, but it's
// small enough to alternatively just include it in our App.js file.

const ydoc = new Y.Doc()

// this allows you to instantly get the (cached) documents data
const indexeddbProvider = new IndexeddbPersistence('string-demo', ydoc)
indexeddbProvider.whenSynced.then(() => {
  console.log('loaded data from indexed db')
})

// Sync clients with the y-webrtc provider.
const webrtcProvider = new WebrtcProvider('string-demo', ydoc)

//Sync clients with the y-websocket provider

const websocketProvider = new WebsocketProvider(
  'ws://localhost:1234', 'string-demo', ydoc
)
  
    

// main component
class App extends React.Component {
  constructor( props ) {
    super( props )
    // initialize our state
    const yBarray = ydoc.getArray('bans')
    const yParray = ydoc.getArray('picks')
    this.state = { bans:yBarray, picks:yParray,
                  bText:"", pText:"" }
    

    // array of numbers which produce a sum
    
    // this.setState({strings:yarray})
    // observe changes of the sum
    yBarray.observe(event => {
      // print updates when the data changes
      this.setState({bans:yBarray})
      //console.log(yarray)
    })

    yParray.observe(event => {
      // print updates when the data changes
      
      this.setState({picks:yParray})
      //console.log(yarray)
    })

  }

  updateBArray(yarray){
    
  }
  

  pushBan(e){
    this.state.bans.push([document.querySelector('#ban').value])
  }

  pushPick(e){
    this.state.picks.push([document.querySelector('#pick').value])
  }

  clearAll(){
    this.state.bans. delete(0, this.state.bans.length)
    this.state.picks.delete(0, this.state.picks.length)
  }

  // render component HTML using JSX 
  render() {
    //let sum = this.state.sum
    console.log(this.state.bans.toArray())
    return (
      
      <div className="App">
        <p>Bans:  {this.state.bans.toArray()}</p>
        <p>Picks: {this.state.picks.toArray()}</p>

        <input id="ban"  type='text' />
          <button onClick={(e)=>this.pushBan(e)}>Add Bans</button>

        <input id="pick" type='text' />
          <button onClick={(e)=>this.pushPick(e)}>Add Picks</button>

        <button onClick={()=>this.clearAll()}>Clear All</button>
      </div>
    )
  }
}

export default App;
