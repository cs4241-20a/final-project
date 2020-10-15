import React, { Component } from 'react';
import './App.css';
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { structGCRefNumber } from 'yjs/dist/src/internals';

class Name extends Component{
  render(){
    return(
      <div class = "name">
        {this.props.name}
      </div>
    )
  }
}
class ChampNameList extends Component{
  render(){
    return(
      <div class = "champList">
        {this.props.champs.map(name => <Name name ={name}/>)}
      </div>
    )
  }
}
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
  
var champNames2 = ['Aatrox','Ahri','Akali','Alistar','Amumu','Anivia','Annie','Aphelios','Ashe','AurelionSol','Azir','Bard','Blitzcrank','Brand','Braum','Caitlyn','Camille','Cassiopeia','Chogath','Corki','Darius','Diana','Draven','DrMundo','Ekko','Elise','Evelynn','Ezreal','FiddleSticks','Fiora','Fizz','Galio','Gangplank','Garen','Gnar','Gragas','Graves','Hecarim','Heimerdinger','Illaoi','Irelia','Ivern','Janna','JarvanIV','Jax','Jayce','Jhin','Jinx','Kaisa','Kalista','Karma','Karthus','Kassadin','Katarina','Kayle','Kennen','Khazix','Kindred','Kled','KogMaw','Leblanc','LeeSin','Leona','Lilia','Lissandra','Lucian','Lulu','Lux','Malphite','Malzahar','Maokai','MasterYi','MissFortune','MonkeyKing','Mordekaiser','Morgana','Nami','Nasus','Nautilus','Neeko','Nidalee','Nocturne','Nunu','Olaf','Orianna','Ornn','Pantheon','Poppy','Pyke','Qiyana','Quinn','Rakan','Rammus','RekSai','Renekton','Rengar','Riven','Rumble','Ryze','Samira','Sejuani','Senna','Sett','Shaco','Shen','Shyvana','Singed','Sion','Sivir','Skarner','Sona','Soraka','Swain','Sylas','Syndra','TahmKench','Taliyah','Talon','Taric','Teemo','Thresh','Tristana','Trundle','Tryndamere','TwistedFate','Twitch','Udyr','Urgot','Varus','Vayne','Veigar','Velkoz','Vi','Viktor','Vladimir','Volibear','Warwick','Xayah','Xerath','XinZhao','Yasuo','Yone','Yorick','Yummi','Zac','Zed','Ziggs','Zilean','Zoe','Zyra'];
// main component
class App extends React.Component {
  constructor( props ) {
    super( props )
    // initialize our state
    const yBarray = ydoc.getArray('bans')
    const yParray = ydoc.getArray('picks')
    //0, 2, 4, 6, 8 blue bans, 
    var selectionsArray = [];
    var selectionsImagesArray = [];
    this.state = {bans:yBarray,
                  picks:yParray,
                  /**bText:"", pText:"",
                  bban1:"", bban2:"", bban3:"", bban4:"", bban5:"",
                  rban1:"", rban2:"", rban3:"", rban4:"", rban5:"",
                  bpick1:"", bpick2:"", bpick3:"", bpick4:"", bpick5:"",
    rpick1:"", rpick2:"", rpick3:"", rpick4:"", rpick5:""**/
                  selections: selectionsArray,
                  selectionsImages: selectionsImagesArray,
                  selectionNumber: 0,
                  searchTerm: "",
                  champNames: ['Aatrox','Ahri','Akali','Alistar','Amumu','Anivia','Annie','Aphelios','Ashe','AurelionSol','Azir','Bard','Blitzcrank','Brand','Braum','Caitlyn','Camille','Cassiopeia','Chogath','Corki','Darius','Diana','Draven','DrMundo','Ekko','Elise','Evelynn','Ezreal','FiddleSticks','Fiora','Fizz','Galio','Gangplank','Garen','Gnar','Gragas','Graves','Hecarim','Heimerdinger','Illaoi','Irelia','Ivern','Janna','JarvanIV','Jax','Jayce','Jhin','Jinx','Kaisa','Kalista','Karma','Karthus','Kassadin','Katarina','Kayle','Kennen','Khazix','Kindred','Kled','KogMaw','Leblanc','LeeSin','Leona','Lilia','Lissandra','Lucian','Lulu','Lux','Malphite','Malzahar','Maokai','MasterYi','MissFortune','MonkeyKing','Mordekaiser','Morgana','Nami','Nasus','Nautilus','Neeko','Nidalee','Nocturne','Nunu','Olaf','Orianna','Ornn','Pantheon','Poppy','Pyke','Qiyana','Quinn','Rakan','Rammus','RekSai','Renekton','Rengar','Riven','Rumble','Ryze','Samira','Sejuani','Senna','Sett','Shaco','Shen','Shyvana','Singed','Sion','Sivir','Skarner','Sona','Soraka','Swain','Sylas','Syndra','TahmKench','Taliyah','Talon','Taric','Teemo','Thresh','Tristana','Trundle','Tryndamere','TwistedFate','Twitch','Udyr','Urgot','Varus','Vayne','Veigar','Velkoz','Vi','Viktor','Vladimir','Volibear','Warwick','Xayah','Xerath','XinZhao','Yasuo','Yone','Yorick','Yummi','Zac','Zed','Ziggs','Zilean','Zoe','Zyra']
                }
    

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
  formatSelection(e){
    let str = e;
    this.selectChampion(str);
  }

  selectChampion(e){
    let tempSelections = this.state.selectionsArray;
    let tempSelectionsImages = this.state.selectionsImagesArray;
    tempSelections[this.state.selectionNumber] = e;
    tempSelectionsImages[this.state.selectionNumber] = "../champion/loading/"+e+"_0.jpg";
    this.setState.selectionsArray = tempSelections;
    this.setState.selectionsImagesArray = tempSelectionsImages;
    this.setState.selectionNumber = this.state.selectionNumber++;
  }
  changeSearchTerm(e){
    this.setState({searchTerm: e.target.value});
  }
  updateList(){
    return this.state.champNames.filter(champ=>champ.toLowerCase().includes(this.state.searchTerm.toLowerCase()))
  }

  // render component HTML using JSX 
  render() {
    //let sum = this.state.sum
    console.log(this.state.bans.toArray())
    return (
      
      <div>
        <div class = "results">
            <div class = "team1">
                <div class = "teamheader1">
                    <h1>Team 1</h1>
                    <h3>Picks</h3>
                </div>
                
                <div class = "picks">
                    <div class = "pick">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[6]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[6]}</div>
                    </div>
                    <div class = "pick">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[9]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[9]}</div>
                    </div>
                    <div class = "pick">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[10]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[10]}</div>
                    </div>
                    <div class = "pick">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[17]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[17]}</div>
                    </div>
                    <div class = "pick">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[18]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[18]}</div>
                    </div>
                </div>
                <h3>Bans</h3>
                <div class = "bans">
                    <div class = "ban">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[0]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[0]}</div>
                    </div>
                    <div class = "ban">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[2]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[2]}</div>
                    </div>
                    <div class = "ban">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[4]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[4]}</div>
                    </div>
                    <div class = "ban">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[13]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[13]}</div>
                    </div>
                    <div class = "ban">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[15]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[15]}</div>
                    </div>
                </div>
            </div>
            <div class = "team2">
                <div class = "teamheader2">
                    <h1>Team 2</h1>
                    <h3>Picks</h3>
                </div>
                <div class = "picks">
                    <div class = "pick">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[7]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[7]}</div>
                    </div>
                    <div class = "pick">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[8]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[8]}</div>
                    </div>
                    <div class = "pick">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[11]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[11]}</div>
                    </div>
                    <div class = "pick">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[16]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[16]}</div>
                    </div>
                    <div class = "pick">
                        <div class = "pickImage">
                          <img src={this.state.selectionsImages[19]}/>
                          </div>
                        <div class = "pickName">{this.state.selectionsArray[19]}</div>
                    </div>
                </div>
                <h3>Bans</h3>
                <div class = "bans">
                    
                    <div class = "ban">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[1]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[1]}</div>
                    </div>
                    <div class = "ban">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[3]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[3]}</div>
                    </div>
                    <div class = "ban">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[5]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[5]}</div>
                    </div>
                    <div class = "ban">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[12]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[12]}</div>
                    </div>
                    <div class = "ban">
                        <div class = "pickImage">
                            <img src={this.state.selectionsImages[14]}/>
                        </div>
                        <div class = "pickName">{this.state.selectionsArray[14]}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="selectionBox">
            <div class="input">
              <form>
                <input id="champ" type="text" placeholder="SEARCH" value = {this.state.searchTerm} onChange = {(e)=>this.updateList(e)}/>
                <button type="submit" onClick = {(e)=>this.formatSelection(e)}>Select</button>
              </form>
              <br></br>
              <ChampNameList champs = {this.updateList()}/>
            </div>
        </div>
    </div>
    )
  }
}

export default App;
