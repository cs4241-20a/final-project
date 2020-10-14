import React from 'react'
import { Button, Form, FormGroup, Input, Container } from 'reactstrap'
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import { ChatFeed, Message } from 'react-chat-ui'
import * as d3 from 'd3'
import { entries } from 'd3'


export default class Home extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            songsJSON: [],
            user1Songs: [],
            user2Songs: [],
            columns: [],
            songNames: [],
            user1Artists: [],
            user2Artists: [],
            user1Albums: [],
            user2Albums: [],
            songPops: [],
            showTable: false,
            user1: "", 
            user2: "",
            staticUser1: "", 
            staticUser2: "",
            showChat: false,
            messages: [
                new Message({ id: 1, message: "I'm the recipient! (The person you're talking to)" }), 
                new Message({ id: 0, message: "I'm you -- the blue bubble!" }),
              ],
            overlay: false,
            overlayStyle: "none", 
            typedMsg: "",
            testArtistsA: [{name: "aaa"}, {name: "bbb"}, {name: "ccc"}, {name: "ddd"}, {name: "eee"}, {name: "ddd"}, {name: "eee"}, {name: "ddd"}, {name: "eee"}],
            testArtistsB: [{name: "bbb"}, {name: "fff"}, {name: "ccc"}, {name: "aaa"}, {name: "ggg"}, {name: "fff"}, {name: "ccc"}, {name: "aaa"}, {name: "ggg"}], 
            testAlbumsA: [{name: "zzz"}, {name: "zzz"}, {name: "yyy"}, {name: "zzz"}, {name: "xxx"}, {name: "vvv"}, {name: "yyy"}, {name: "ddd"}, {name: "vvv"}],
            testAlbumsB: [{name: "zzz"}, {name: "yyy"}, {name: "xxx"}, {name: "www"}, {name: "www"}, {name: "www"}, {name: "vvv"}, {name: "www"}, {name: "zzz"}],
            testPopularityA: [{popularity: 0}, {popularity: 93}, {popularity: 45}, {popularity: 17}, {popularity: 56}, {popularity: 90}, {popularity: 3}, {popularity: 82}], 
            testPopularityB: [{popularity: 55}, {popularity: 23}, {popularity: 48}, {popularity: 47}, {popularity: 58}, {popularity: 90}, {popularity: 32}, {popularity: 12}]
        }

        this.overlayDiv = React.createRef()

        this.getSongs = this.getSongs.bind(this)
        this.handleUser1Change = this.handleUser1Change.bind(this)
        this.handleUser2Change = this.handleUser2Change.bind(this)
        this.setChatState = this.setChatState.bind(this)
        this.toggleOverlay = this.toggleOverlay.bind(this)
        this.handleMessageChange = this.handleMessageChange.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
        this.parseSongs = this.parseSongs.bind(this)
    }


    // Get form value on change
    handleUser1Change (e) { this.setState({ user1: e.target.value }) }
    handleUser2Change (e) { this.setState({ user2: e.target.value }) }

    handleMessageChange (e) { this.setState({ typedMsg: e.target.value }) }

    // Send request to server for songs in common
    getSongs() {
        // FOR WHEN SERVER IS SET UP
        let bodyJson = {user1: this.state.user1, user2: this.state.user2};
        fetch('/getSongs', {
            method: 'POST',
            body: JSON.stringify(bodyJson),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json()).then(json => {

            this.setState({
                staticUser1: this.state.user1, 
                staticUser2: this.state.user2, 
                songsJSON: json.intersection,
                columns: [{ dataField: 'title', text: ``}],
                showTable: true,
                user1: "",
                user2: "", 
                user1Artists: json.user1Artists, 
                user2Artists: json.user2Artists, 
                user1Albums: json.user1Albums, 
                user2Albums: json.user2Albums
            })
            this.parseSongs()
        });

    }

    parseSongs() {
        let songNames = []
        let songPops = []
        console.log(this.state.songsJSON)

        for (let i = 0; i < this.state.songsJSON.length; i++) {
            songPops.push({ popularity: this.state.songsJSON[i].popularity })
            songNames.push({ id: i, title: this.state.songsJSON[i].name })            
        }

        this.setState({ 
            songNames: songNames, 
            songPops: songPops 
        })
    }

    login() {
        fetch('/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => response.json()).then((link) => {
            window.open(link['link'], '_blank');
        });
    }

    setChatState() {
        this.setState({
            showChat: true
        })
    }

    toggleOverlay() {
        if (this.state.overlayStyle === "block") {
            this.setState({ 
                overlayStyle: "none",
                showChat: false 
            });
            document.body.style.overflow = "unset"
        }
    }

    // NEED TO WATCH LECTURES FOR THIS PART (i think)
    sendMessage() {
        // FOR WHEN SERVER IS SET UP
        //let bodyJson = {id: this.state.latestId, message: this.state.typedMsg}
        // fetch('/postMsg', {
        //     method: 'POST',
        //     body: JSON.stringify(bodyJson),
        //     headers: {
        //         "Content-Type": "application/json"
        //     }
        // }).then(response => response.json())
        this.setState({ typedMsg: "" })
    }


    render () {
        // Show table on recieving data from server
        const renderTable = () => {
            if (this.state.showTable) {
                return (   
                    <div>    
                        <h2 className="mt-5 mb-10 user-title">{this.state.staticUser1} and {this.state.staticUser2}</h2>

                        <div className="mt-5 mb-10">
                            <h4 className="subtitle">Songs in Common</h4>
                            <BootstrapTable 
                            rowStyle={{ backgroundColor: '#ffffff' }}
                            
                            border={true}
                            keyField='id' data={ this.state.songNames } 
                            columns={ this.state.columns } 
                            pagination={ paginationFactory() } 
                            bootstrap4={true} />
                        </div>
                    </div>  
                )
            }
        }

        const renderChat = () => {
            if (this.state.showChat) {
                if (this.state.overlayStyle !== "block") {
                    this.setState({ overlayStyle: "block" })
                    document.body.style.overflow = 'hidden'
                }

                return (
                    <div id="chatDiv">
                        
                        <Container>
                            <h1 style={{color: "#191414"}} className="mt-5 mb-10">Chat</h1>
                                <ChatFeed
                                messages={this.state.messages} // Array: list of message objects
                                isTyping={this.state.is_typing} // Boolean: is the recipient typing
                                hasInputField={false} // Boolean: use our input, or use your own
                                showSenderName // show the name of the user who sent the message
                                bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
                                bubbleStyles={
                                {
                                    text: {
                                        fontSize: 16
                                    },
                                    chatbubble: {
                                        borderRadius: 70,
                                        padding: 10,
                                        backgroundColor: '#1DB954',
                                    },
                                    recipientChatbubble: {
                                        backgroundColor: '#191414',
                                    },
                                    }
                                }
                                />
                        </Container>

                        <div id="writeMsgDiv">
                            <Input type="text" placeholder="Type a message" style={{width: "80%", marginRight: "20px"}} onChange={this.handleMessageChange} value={this.state.typedMsg} ></Input>
                            <Button className="btn btn-primary" onClick={this.sendMessage}>Send</Button>
                        </div>

                    </div>
                    )
            }
        }

        const renderArtists = () => {
            let group1Map = d3.rollup(this.state.user1Artists, v => v.length, d => d.name)
            let group2Map = d3.rollup(this.state.user2Artists, v => v.length, d => d.name)

            let group1MapAll = d3.group(this.state.user2Artists, d => d.name)

            let group1Keys = []
            for (let [key, value] of Array.from(group1Map)) {
                //console.log("key: " + key + " value: " + value)
                group1Keys.push(key)
            }

            let group2Keys = []
            for (let [key, value] of Array.from(group2Map)) {
                group2Keys.push(key)
            }

            let combinedKeys = (d3.intersection(group1Keys, group2Keys))

            let groupValues = []
            for (let item of combinedKeys.values()) {
                let sum = group1Map.get(item) + group2Map.get(item)
                groupValues.push({ title: item, sum: sum })
            }

            groupValues.sort(function(x, y){
                return d3.descending(x.sum, y.sum);
            })

            groupValues = groupValues.slice(0, 3)

            groupValues = groupValues.slice(0, 3)
            for (let i = 0 ; i < groupValues.length ; i++) {
                let fullObj = group1MapAll.get(groupValues[i].title)
                console.log(fullObj)
                //groupValues[i].image = fullObj[0].images[1]
            }

            if (this.state.showTable && groupValues.length > 0) {
                return (
                    <Container className="mt-5 mb-10">
                        <h4 className="subtitle">Top Artists in Common</h4>

                        <div className="artistDiv">
                            {groupValues.map(value => (
                                <div className="artistName">
                                    <div>
                                        {/* <img src={value.image.url}/> */}
                                    </div>
                                    <div>{value.title}</div>
                                </div>
                            ))}
                        </div>
                    </Container>
                )
            }
        }

        const renderAlbums = () => {
            let group1Map = d3.rollup(this.state.user1Albums, v => v.length, d => d.name)
            let group2Map = d3.rollup(this.state.user2Albums, v => v.length, d => d.name)

            let group1MapAll = d3.group(this.state.user1Albums, d => d.name)

            let group1Keys = []
            for (let [key, value] of Array.from(group1Map)) {
                group1Keys.push(key)
            }

            let group2Keys = []
            for (let [key, value] of Array.from(group2Map)) {
                group2Keys.push(key)
            }

            let combinedKeys = (d3.intersection(group1Keys, group2Keys))

            let groupValues = []
            for (let item of combinedKeys.values()) {
                let sum = group1Map.get(item) + group2Map.get(item)
                groupValues.push({ title: item, sum: sum })
            }

            groupValues.sort(function(x, y){
                return d3.descending(x.sum, y.sum);
            })

            groupValues = groupValues.slice(0, 3)

            for (let i = 0 ; i < groupValues.length ; i++) {
                let fullObj = group1MapAll.get(groupValues[i].title)
                groupValues[i].artist = fullObj[0].artists.name
                groupValues[i].image = fullObj[0].images[1]
            }

            if (this.state.showTable && groupValues.length > 0) {
                return (
                    <Container className="mt-5 mb-10">
                        <h4 className="subtitle">Top Albums in Common</h4>

                        <div className="artistDiv">
                            {groupValues.map(value => (
                                // add images too 
                                <div className="artistName">
                                    <div>
                                        <img src={value.image.url}/>
                                    </div>
                                    <div>{value.title}</div>
                                    <div>{value.artist}</div>
                                </div>
                            ))}
                        </div>
                    </Container>
                )
            }
        }
        
        const renderPopularity = () => {
            let pop1Calc = (d3.mean(this.state.testPopularityA, d => d.popularity)).toFixed(2)
            let pop2Calc = (d3.mean(this.state.testPopularityB, d => d.popularity)).toFixed(2)

            if (this.state.showTable) {
                return (
                    <Container className="mt-5 mb-10">
                        <h4 className="subtitle">Average Song Popularity</h4>

                        <div className="artistDiv">
                            {/* <div id="pop1"></div> */}
                            <div className="artistName">{ pop1Calc }%</div>
                            {/* <div id="pop2"></div> */}
                            <div className="artistName">{ pop2Calc }%</div>
                        </div> 
                    </Container>
                )
            }
        }
 

        return (
            <div id="wrapperDiv">

                <div id="overlay" onClick={this.toggleOverlay} ref="overlayDiv" style={{display: this.state.overlayStyle}}></div>
                <Container id="mainDiv" >

                    <h1 className="mt-5 mb-10" style={{color: "#ffffff"}}>Unify</h1>

                    <div className="mt-5 mb-10">
                        <Form>
                            <FormGroup>
                                <Input type="text" placeholder="login_username else placeholder text" className="form-control" value={this.state.user1} onChange={this.handleUser1Change} required></Input>
                            </FormGroup>                    
                            <FormGroup>
                                <Input type="text" placeholder="Enter another username" className="form-control"  value={this.state.user2} onChange={this.handleUser2Change}  required></Input>
                            </FormGroup>
                            <FormGroup>
                                <Button className="btn btn-lg btn-block" style={{backgroundColor: "#1DB954", border: "none", outline: "none"}} onClick={this.login}>Login</Button>
                            </FormGroup>
                            <FormGroup>
                                <Button className="btn btn-lg btn-block" style={{backgroundColor: "#1DB954", border: "none", outline: "none"}} onClick={this.getSongs}>Compare data</Button>
                            </FormGroup>
                        </Form>
                    </div>

                    { renderTable() }

                    { renderArtists() }

                    { renderAlbums() }

                    { renderPopularity() }

                    <FontAwesomeIcon icon={faComment} className="fas-3x sticky-chat" onClick={this.setChatState} />

                </Container>

                { renderChat() }

            </div>
        )
    }

}
