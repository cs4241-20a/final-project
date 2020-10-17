import React from 'react'
import axios from "axios"
import {IndexeddbPersistence} from "y-indexeddb";
import * as Y from "yjs";
import './App.css';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';

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

export default class CompletedStoryIndividualPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            story: null,
            chosenVote: null,
            isAuthor: false,
        };
    }

    componentDidMount() {
        let that = this;
        const urlParams = new URLSearchParams(window.location.search);
        const _id = urlParams.get('id');
        axios.post('/getbyID', {_id}).then(function (response) {
            const ydoc = new Y.Doc()
            const indexeddbProvider = new IndexeddbPersistence(response.data._id, ydoc)
            indexeddbProvider.whenSynced.then(() => {
                console.log(response.data.story)
                that.setState({
                    story: response.data.story
                });
                fetch("/currentUser").then(function (res) {
                    return res.json()
                }).then((json) => {
                    return json.user
                })
                    .then((id) => {
                        if (id == response.data.story.contributors[0]) {
                            that.setState({
                                isAuthor: true
                            })
                        }
                        response.data.story.votes.forEach((ele) => {
                            if (ele.id === id) {
                                that.setState({chosenVote: ele.value});
                            }
                        })
                    })

                console.log(that.state)
            })
        })
    }

    render() {
        if (this.state.story != null) {
            const d = new Date(this.state.story.timeEnd)
            console.log(this.state.story.timeEnd - this.state.story.timeStart)
            const dur = this.state.story.timeEnd - this.state.story.timeStart
            return (
                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <ThemeProvider theme={theme}>
                        <Paper style={{
                            minHeight: 400,
                            minWidth: 400,
                            padding: theme.spacing(2),
                            display: 'flex',
                            flexDirection: "column",
                            flexWrap: "wrap"
                        }}>
                            <div>
                                <h1 className="title" id="title" style={{
                                    textAlign: 'center',
                                    color: 'white'
                                }}>{this.state.story.title}</h1>{this.state.isAuthor ?
                                <Button id="editTitle" variant="contained" onClick={this.editTitle.bind(this)}>edit
                                    title</Button> : null}
                                <p style={{color: 'white'}}>{this.state.story.listofwords.join(' ') + '.'}</p>
                            </div>
                            <div style={{marginRight: '10px'}}>
                                <ThumbUpIcon
                                    style={{color: this.state.chosenVote === 1 ? theme.palette.secondary.main : 'white'}}
                                    onClick={() => this.setVote(1)}/>
                                <ThumbDownIcon
                                    style={{color: this.state.chosenVote === -1 ? theme.palette.secondary.main : 'white'}}
                                    onClick={() => this.setVote(-1)}/>
                                <p className="lowPriority">Points: {this.getVotes(this.state.story.votes)}</p>
                                <p className="lowPriority">Author: {this.state.story.contributors[0]}</p>
                                <p className="lowPriority">Story Type: {this.state.story.storyType}</p>
                                <em className="lowPriority">Finished {d.toLocaleDateString()} at {d.toLocaleTimeString()} </em>
                                <br/>
                                <em className="lowPriority">Took
                                    {Math.floor(dur / 3600000) > 0 ? (Math.floor(dur / 3600000) + 'hour' + ((Math.floor(dur / 3600000) == 1) ? "" : "s")) : ''} {Math.floor(dur / 60000) % 60} minute{(Math.floor(dur / 60000) % 60 == 1) ? "" : "s"} to
                                    complete.</em>
                            </div>
                        </Paper>
                    </ThemeProvider>
                </div>
            )
        }
        return null;
    }

    editTitle(e) {
        e.preventDefault();
        const but = document.querySelector('#editTitle');
        console.log(but.value, but.value == 'edit title')
        if (but.value == 'edit title') {
            but.value = 'save';
            document.querySelector('#title').contentEditable = true;
        } else {
            but.value = 'edit title';
            axios.post('/edittitle', {title: document.querySelector('#title').innerText, _id: this.state.story._id})
                .then(res => {
                    console.log("EDITED!");
                })
            document.querySelector('#title').contentEditable = false;
        }
    }

    setVote(vote) {
        //where vote is -1, 0, or 1
        console.log(this.state.chosenVote)
        console.log(vote)
        if (this.state.chosenVote === vote) {
            this.setState({chosenVote: 0})
            vote = 0;
        } else {
            this.setState({chosenVote: vote});
        }
        console.log("Voting!")
        let that = this;
        let newVotes = that.state.story.votes;
        fetch("/currentUser").then(function (response) {
            return response.json()
        }).then(function (json) {
            if (!newVotes.map(a => a.id).includes(json.user)) {
                that.state.story.votes.push({id: json.user, value: vote});
            } else {
                that.state.story.votes[that.state.story.votes.indexOf(that.state.story.votes.find(obj => obj.id === json.user))] = {
                    id: json.user,
                    value: vote
                };
            }
            console.log(that.state.story.votes);
            axios.post('/changeVote', {
                _id: that.state.story._id,
                votes: that.state.story.votes
            }).then(response => {
                that.forceUpdate();
                console.log("reached here");
            })
        })

    }

    //assumes that vote objects in the votes array have a value field alongside an id field
    getVotes(votes) {
        let voteCount = 0;
        for (const vote in votes) {
            voteCount += votes[vote].value;
        }
        return voteCount;
    }
}