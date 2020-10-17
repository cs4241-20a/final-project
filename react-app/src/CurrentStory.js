import axios from 'axios';
import React from 'react';
import TextField from '@material-ui/core/TextField';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import * as Y from 'yjs'
import {WebrtcProvider} from 'y-webrtc'
import {WebsocketProvider} from 'y-websocket'
import {IndexeddbPersistence} from 'y-indexeddb'

const ydoc = new Y.Doc()
let yarray
let currentUser

const theme = createMuiTheme({
    spacing: 8,
    palette: {
        type: 'dark',
        primary: {
            main: "#7e57c2", //purple
        },
        secondary: {
            main: '#ba68c8', //green
        },
    },
});

export default class CurrentStory extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            listOfWords: [],
            maxWords: -1,
            title: '',
            id: -1,
            curWordCount: 0,
            isWordType: null,
            contributors: null,
            skip: 0
        }
    }

    componentDidMount() {
        fetch("/currentUser").then(function (response) {
            return response.json()
        }).then(function (json) {
            currentUser = json.user
        })
        axios.get('/getcurstory')
            .then(res => {
                if (res.data.status === "nostory") {
                    window.open('/createstory', "_self");
                } else {
                    this.setState({isWordType: res.data.storyType === 'word'})
                    // this allows you to instantly get the (cached) documents data
                    const indexeddbProvider = new IndexeddbPersistence(res.data._id, ydoc)
                    indexeddbProvider.whenSynced.then(() => {
                        console.log('loaded data from indexed db')
                    })
                    // Sync clients with the y-webrtc provider.
                    const webrtcProvider = new WebrtcProvider(res.data._id, ydoc)
                    // Sync clients with the y-websocket provider
                    const websocketProvider = new WebsocketProvider(
                        'wss://demos.yjs.dev', res.data._id, ydoc
                    )
                    yarray = ydoc.getArray(res.data._id)
                    this.setState({
                        listOfWords: res.data.listofwords,
                        maxWords: res.data.maxwords,
                        title: res.data.title,
                        id: res.data._id,
                        curWordCount: res.data.listofwords.length,
                        contributors: res.data.contributors,
                        skip: res.data.skip
                    });
                }
                //called when yarray is modified
                yarray.observe(event => {
                    console.log("CONTRIBUTORS: ", yarray.toArray().map(a => a.user))
                    this.setState({
                        listOfWords: yarray.toArray().map(a => a.word),
                        curWordCount: yarray.toArray().length,
                        contributors: yarray.toArray().map(a => a.user)
                    }, function () {
                        if (this.state.maxWords == yarray.length) {
                            alert("Story is complete!");
                            window.open('/', '_self');
                        } else {
                            console.log(yarray.toArray());
                        }
                    });
                });
            })
    }

    addWord(e) {
        e.preventDefault();
        const nextword = document.querySelector('#nextword').value.trim();
        if (nextword.split(' ').length > 1 && this.state.isWordType) {
            alert('Cannot upload multiple words for this story');
        } else if (!this.enoughEntries()) {
            alert("Wait your turn!");
        } else {
            yarray.push([{word: nextword, user: currentUser}]);
            document.querySelector('#nextword').value = '';
            axios.post('/addword', {
                'id': this.state.id,
                'word': nextword,
                'contributors': yarray.toArray().map(a => a.user)
            })
                .then(response => {
                    console.log("Pushed new word to database")
                })
        }
    }

    render() {
        let skipTry = 0;
        if (yarray !== undefined) {
            skipTry = (yarray.toArray().map(a => a.user).lastIndexOf(currentUser) === -1) ? 0 : this.state.skip - (yarray.length - yarray.toArray().map(a => a.user).lastIndexOf(currentUser) - 1);
            console.log("Length", yarray.length)
            console.log("last index", yarray.toArray().map(a => a.user).lastIndexOf(currentUser))
            console.log("Skip: ", this.state.skip)
            console.log("skipTry: ", skipTry);
        }
        return (
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                <h1 className="title">{this.state.title}</h1>
                <ThemeProvider theme={theme}>
                    <div className="subtitle">
                        {this.state.listOfWords.map(word => (
                            <span>{word} </span>
                        ))}
                        <br/>
                        <form>
                            <TextField style={{margin: theme.spacing(1)}} id="nextword"
                                       label="Next input" type="text" placeholder="enter a word or phrase"
                                       variant="filled" margin="normal" InputLabelProps={{shrink: true}}
                            />
                            <input style={{visibility: 'hidden', height: '0px', width: '0px'}} type="submit"
                                   onClick={this.addWord.bind(this)}/>
                        </form>
                        <br/>
                        <h2 className="content">{(yarray !== undefined) ? ((skipTry < 0) ? 0 : skipTry) : ""} more users
                            must contribute before you can.</h2>
                        <h2 className="lowPriority">THERE
                            ARE {this.state.maxWords - this.state.curWordCount} {this.state.isWordType ? 'WORDS' : 'PHRASES'} REMAINING.</h2>
                    </div>
                </ThemeProvider>
            </div>
        );
    }

    enoughEntries() {
        //needs to cycle through current contributor list and see how many non-current users are at the end of the list
        let posValue = (yarray.toArray().map(a => a.user).lastIndexOf(currentUser) === -1) ? 0 : this.state.skip - (yarray.length - yarray.toArray().map(a => a.user).lastIndexOf(currentUser) - 1);
        console.log("Length", yarray.length)
        console.log("last index", yarray.toArray().map(a => a.user).lastIndexOf(currentUser))
        console.log(this.state.skip)
        console.log("posValue: ", posValue);
        //return true if this value is array length or >= skip
        return (posValue <= 0);
    }
}