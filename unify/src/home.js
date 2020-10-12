import React from 'react'
import { Button, Form, FormGroup, Input, Container } from 'reactstrap'
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import { ChatFeed, Message } from 'react-chat-ui'
import * as d3 from 'd3'


export default class Home extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            songs: [{ id: 0, title: "song0" }, { id: 1, title: "song1" }, { id: 2, title: "song2" }, { id: 3, title: "song3" }, { id: 4, title: "song4" }, { id: 5, title: "song5" }, { id: 6, title: "song6" }, { id: 7, title: "song7" }, { id: 8, title: "song8" }, { id: 9, title: "song9" }, { id: 10, title: "song10" }, { id: 11, title: "song11" }, { id: 12, title: "song12" }, { id: 13, title: "song13"}],
            columns: [],
            //songs: [],
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
            testArtistsB: [{name: "bbb"}, {name: "fff"}, {name: "ccc"}, {name: "aaa"}, {name: "ggg"}, {name: "fff"}, {name: "ccc"}, {name: "aaa"}, {name: "ggg"}]
        }

        this.overlayDiv = React.createRef()

        this.getSongs = this.getSongs.bind(this)
        this.handleUser1Change = this.handleUser1Change.bind(this)
        this.handleUser2Change = this.handleUser2Change.bind(this)
        this.setChatState = this.setChatState.bind(this)
        this.toggleOverlay = this.toggleOverlay.bind(this)
        this.handleMessageChange = this.handleMessageChange.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
    }


    // Get form value on change
    handleUser1Change (e) { this.setState({ user1: e.target.value }) }
    handleUser2Change (e) { this.setState({ user2: e.target.value }) }

    handleMessageChange (e) { this.setState({ typedMsg: e.target.value }) }

    // Send request to server for songs in common
    getSongs() {
        // FOR WHEN SERVER IS SET UP
        // let bodyJson = {user1: this.state.user1, user2: this.state.user2}
        // fetch('/getSongs', {
        //     method: 'POST',
        //     body: JSON.stringify(bodyJson),
        //     headers: {
        //         "Content-Type": "application/json"
        //     }
        // }).then(response => response.json())
        // .then(json => {
        //     console.log("SONGS FROM SERVER: " + json)
        //     let staticUser1 = this.state.user1
        //     let staticUser2 = this.state.user2
        //     this.setState({
        //         songs: json,
        //         columns: [{ dataField: 'title', text: `Songs in Common Between ${staticUser1} and ${staticUser2}`}],
        //         showTable: true,
        //          staticUser1: this.state.user1,
        //          staticUser2: this.state.user2,
        //         user1: "",
        //         user2: ""
        //     })
        // }) 

        // TEMP FOR FRONT END TESTING
        this.setState({ 
            showTable: true,
            columns: [
                { dataField: 'title', text: ``, 
                headerStyle: { backgroundColor: "#ffffff"}
            }
            ],
            staticUser1: this.state.user1,
            staticUser2: this.state.user2,
            user1: "",
            user2: ""
        })
        
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
            })
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
                            keyField='id' data={ this.state.songs } 
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
            let group1Map = d3.rollup(this.state.testArtistsA, v => v.length, d => d.name)
            let group2Map = d3.rollup(this.state.testArtistsB, v => v.length, d => d.name)

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
                groupValues.push({ title: item, sum: sum})
            }

            groupValues.sort(function(x, y){
                return d3.descending(x.sum, y.sum);
            })

            if (this.state.showTable) {
                return (
                    <Container className="mt-5 mb-10">
                        <h4 className="subtitle">Top Artists in Common</h4>

                        <div className="artistDiv">
                            {groupValues.map(value => (
                                // add images too 
                                <div className="artistName">{value.title}</div>
                            ))}
                        </div>
                    </Container>
                )
            }
        }
        
        const renderPopularity = () => {
            
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
                                <Button className="btn btn-lg btn-block" style={{backgroundColor: "#1DB954", border: "none", outline: "none"}} onClick={this.getSongs}>Compare data</Button>
                            </FormGroup>
                        </Form>
                    </div>

                    { renderTable() }

                    { renderArtists() }

                    { renderPopularity() }

                    <FontAwesomeIcon icon={faComment} className="fas-3x sticky-chat" onClick={this.setChatState} />

                </Container>

                { renderChat() }

            </div>
        )
    }

}
