import axios from 'axios';
import React from 'react';
import './App.css';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentStory: {},
            currentStoryStatus: {},
        };
    }

    componentDidMount() {
        axios.get('/getcurstory')
            .then(response => {
                if (response.data.status === 'nostory') {
                    console.log("NO STORY!");
                } else {
                    this.setState({
                        currentStory: {}
                    });
                }

            })
    }


    jumpToStory(id) {
        this.props.setCurrentInProgressStory(id);
        window.open('/inProgressStory', "_self");
    }

    render() {
        return (
            <div className="App" style={{
                display: 'flex',
                flexDirection: "column",
                justifyContent: 'space-around',
                alignItems: 'center'
            }}>
                <h1 className="title">One Word Story</h1>
                <br/>
                <a style={{color: '#ba68c8'}} className="content" href="/contribute">Contribute</a>
                <br/>
                <div className="lowPriority">
                    ICON MADE BY ICONKING FROM WWW.FREEICONS.IO
                </div>

            </div>
        );
    }
}
