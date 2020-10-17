import React, { Component } from 'react'
import Button from "react-bootstrap/Button"
export class Chat extends Component {
    constructor(props){
        super(props)
        this.state = {
            socket: props.socket
        }
        this.state.socket.on("message", (data) => {
            console.log(data)
          })
    }
    render() {        
        return (
            <div>
                <Button variant="dark" onClick={() => {
                    this.state.socket.emit("chat", "PEE PEE ")
                }}>Test</Button>
            </div>
        )
    }
}

export default Chat
