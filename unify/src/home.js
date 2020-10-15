import React from 'react'
import { Button, Form, FormGroup, Input, Container } from 'reactstrap'
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import { ChatFeed, Message } from 'react-chat-ui'
import WebSocket from 'websocket'
import { w3cwebsocket as W3CWebSocket } from "websocket";

// const ws = require('ws');

const ws = new W3CWebSocket('ws://localhost:8000');

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
            showChat: false,
            messages: [
                // new Message({ id: 0, message: this.state.messages.map(message => <p>{message.msg}</p>) }), 
                // new Message({ id: 0, message: "I'm you -- the blue bubble!" }),
                

              ],
            overlay: false,
            overlayStyle: "none", 
            typedMsg: "",
            chatInput: ""
        }

         
        this.overlayDiv = React.createRef()

        // this.send = this.send.bind(this)
        
        this.getSongs = this.getSongs.bind(this)
        this.handleUser1Change = this.handleUser1Change.bind(this)
        this.handleUser2Change = this.handleUser2Change.bind(this)
        this.setChatState = this.setChatState.bind(this)
        this.toggleOverlay = this.toggleOverlay.bind(this)
        this.handleMessageChange = this.handleMessageChange.bind(this)
        // this.sendMessage = this.sendMessage.bind(this)
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
            for(let i = 0; i < json.length; i++){
                console.log(json[i]);
            }
            let staticUser1 = this.state.user1;
            let staticUser2 = this.state.user2;
            this.setState({
                songs: json,
                columns: [{ dataField: 'title', text: `Songs in Common Between ${staticUser1} and ${staticUser2}`}],
                showTable: true,
                user1: "",
                user2: ""
            })
        });

        // TEMP FOR FRONT END TESTING
        // let staticUser1 = this.state.user1
        // let staticUser2 = this.state.user2
        // this.setState({
        //     showTable: true,
        //     columns: [
        //         { dataField: 'title', text: `Songs in Common Between ${staticUser1} and ${staticUser2}`,
        //         headerStyle: { backgroundColor: "#ffffff"}
        //     }
        //     ],
        //     user1: "",
        //     user2: ""
        // });

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

    // // NEED TO WATCH LECTURES FOR THIS PART (i think)
    // sendMessage() {
    //     // FOR WHEN SERVER IS SET UP
    //     //let bodyJson = {id: this.state.latestId, message: this.state.typedMsg}
    //     // fetch('/postMsg', {
    //     //     method: 'POST',
    //     //     body: JSON.stringify(bodyJson),
    //     //     headers: {
    //     //         "Content-Type": "application/json"
    //     //     }
    //     // }).then(response => response.json())
    //     this.setState({ typedMsg: "" })
    // }


    onButtonClicked = (value) => {
        // const txt = document.getElementById('chatinput').value
        ws.send(JSON.stringify({
            type: "message",
            msg: document.getElementById('chatinput').value

        }));
        this.setState ({
            typedMsg: ""
        })      
    }


    componentDidMount() {

        ws.onopen = () => {
            console.log("connection to websocket server");
    };
        ws.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);
            console.log("got reply!", dataFromServer);
            if(dataFromServer.type === "message") {
                // const  = ([new Message({id: 0, message: dataFromServer.msg})])
                this.setState((state) =>
                ({
                    messages: this.state.messages.concat([new Message({id: 0, message: dataFromServer.msg})])
                    
                })
                
                );
            }
        };
    }

   
     

render () {
        // Show table on recieving data from server
        const renderTable = () => {
            if (this.state.showTable) {
                return (                
                <div className="mt-5 mb-10">
                    <BootstrapTable 
                    rowStyle={{ backgroundColor: '#ffffff' }}
                    
                    border={true}
                    keyField='id' data={ this.state.songs } 
                    columns={ this.state.columns } 
                    pagination={ paginationFactory()} 
                    bootstrap4={true} />
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
                                // messages={this.state.messages.map(message => <p>{message.msg}</p>)}
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
                            <Input type="text" id="chatinput" value={this.state.chatInput} placeholder="Type a message" style={{width: "80%", marginRight: "20px"}} onChange={this.handleMessageChange} 
                            value={this.state.typedMsg} ></Input>
                            <Button className="btn btn-primary" onClick={() => this.onButtonClicked(this.state.messages)}>Send</Button>
                        </div>
                    </div>

// onClick={this.componentDidMount}

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

                    <FontAwesomeIcon icon={faComment} className="fas-3x sticky-chat" onClick={this.setChatState} />

                </Container>

                { renderChat() }

            </div>
        )
    }

}
