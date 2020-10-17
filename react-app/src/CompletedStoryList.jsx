import React from 'react'
import './App.css';
import Paper from '@material-ui/core/Paper';
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

export default class CompletedStoryList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            demoStories: []
        };
    }

    componentDidMount() {
        let that = this;
        fetch("/getallcompleted").then(function (response) {
            return response.json()
        })
            .then(function (json) {
                json.stories.forEach((ele) => {
                    console.log(ele)
                    console.log(ele.votes)
                    ele.votes = that.getVotes(ele.votes)
                    console.log(ele.votes)
                });
                json.stories.sort((a, b) => b.votes - a.votes);
                that.setState({
                    demoStories: json.stories
                });
            })
        // that.setState({
        //     demoStories : [{votes: 1, _id: 1, title: 'demoTitle'}]
        // });
    }

    render() {
        return (<ThemeProvider theme={theme}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", flexWrap: "wrap"}}>
                <h1 className="title">Completed Stories</h1>
                {this.state.demoStories.map((story) => {
                    return (<Paper style={{margin: theme.spacing(1), padding: theme.spacing(2), width: 400}}
                                   onClick={() => this.click(story._id)}>
                        <div style={{cursor: 'pointer'}}>
                            <div className="subtitle">{story.title}</div>
                            <div className="lowPriority">{`${story.votes} VOTES`}</div>
                        </div>
                        <div className="content">{this.getFirstWords(story.listofwords)}</div>
                    </Paper>)
                })}
            </div>
        </ThemeProvider>)
    }

    //assumes that vote objects in the votes array have a value field
    getVotes(votes) {
        let voteCount = 0;
        for (const vote in votes) {
            voteCount += votes[vote].value;
        }
        return voteCount;
    }

    getFirstWords(listOfWords) {
        let firstX = "";
        listOfWords.forEach((ele, index) => {
            if (index < 3) {
                firstX += `${ele} `;
            } else if (index === 3) {
                firstX += '...'
            }
        })
        return firstX
    }


    click(id) {
        this.props.setCurrentStory(id);
        setTimeout(() => window.open('/completeStory?id=' + id, "_self"), 10);
    }


}
