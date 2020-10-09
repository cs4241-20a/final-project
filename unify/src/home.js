import React from 'react'
import { Button, Form, FormGroup, Input, Container } from 'reactstrap'
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'
import { faComments } from '@fortawesome/free-solid-svg-icons'


export default class Home extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            // columns: [{ dataField: 'title', text: 'Songs in Common'}],
            songs: [{ id: 0, title: "song0" }, { id: 1, title: "song1" }, { id: 2, title: "song2" }, { id: 3, title: "song3" }, { id: 4, title: "song4" }, { id: 5, title: "song5" }, { id: 6, title: "song6" }, { id: 7, title: "song7" }, { id: 8, title: "song8" }, { id: 9, title: "song9" }, { id: 10, title: "song10" }, { id: 11, title: "song11" }, { id: 12, title: "song12" }, { id: 13, title: "song13"}],
            columns: [],
            //songs: [],
            showTable: false,
            user1: "", 
            user2: "",
            showChat: false
        }

        this.getSongs = this.getSongs.bind(this)
        this.handleUser1Change = this.handleUser1Change.bind(this)
        this.handleUser2Change = this.handleUser2Change.bind(this)
        this.setChatState = this.setChatState.bind(this)
    }

    // Get form value on change
    handleUser1Change (e) { this.setState({ user1: e.target.value }) }
    handleUser2Change (e) { this.setState({ user2: e.target.value }) }

    // Send request to server for songs in common
    getSongs() {
        // FOR WHEN SERVER IS SET UP
        // let bodyJson = [{user1: this.state.user1}, {user2: this.state.user2}]
        // fetch('/DUMMY_PATH_TO_GET_SONGS', {
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
        //         user1: "",
        //         user2: ""
        //     })
        // }) 

        // TEMP FOR FRONT END TESTING
        let staticUser1 = this.state.user1
        let staticUser2 = this.state.user2
        this.setState({ 
            showTable: true,
            columns: [{ dataField: 'title', text: `Songs in Common Between ${staticUser1} and ${staticUser2}`}],
            user1: "",
            user2: ""
        })
        
    }

    setChatState() {
        this.setState({
            showChat: true
        })
    }


    render () {
        // Show table on recieving data from server
        const renderTable = () => {
            if (this.state.showTable) {
                return (                
                <div className="mt-5 mb-10">
                    <BootstrapTable keyField='id' data={ this.state.songs } columns={ this.state.columns } pagination={ paginationFactory() } bootstrap4={true} />
                </div>
                )
            }
        }

        const renderChat = () => {
            if (this.state.showChat) {
                return (
                    <Container id="chatDiv">
                        
                    </Container>
                    )
            }
        }

        return (
            <div id="wrapperDiv">
                <Container id="mainDiv">

                    <h1 className="mt-5 mb-10">Spotify Friends</h1>

                    <div className="mt-5 mb-10">
                        <Form>
                            <FormGroup>
                                <Input type="text" placeholder="login_username else placeholder text" className="form-control" value={this.state.user1} onChange={this.handleUser1Change} required></Input>
                            </FormGroup>                    
                            <FormGroup>
                                <Input type="text" placeholder="Enter another username" className="form-control"  value={this.state.user2} onChange={this.handleUser2Change}  required></Input>
                            </FormGroup>
                            <FormGroup>
                                <Button className="btn btn-primary btn-lg btn-block" onClick={this.getSongs}>Compare data</Button>
                            </FormGroup>
                        </Form>
                    </div>

                    { renderTable() }

                    <FontAwesomeIcon icon={faComments} className="fa-3x sticky-chat" onClick={this.setChatState} />

                </Container>

                { renderChat() }

                
            </div>
        )
    }

}
