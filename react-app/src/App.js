import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Home from './Home'
import CreateStory from './CreateStory'
import TopBar from './TopBar'
import CompletedStoryList from './CompletedStoryList'
import CompletedStoryIndividualPage from './CompletedStoryIndividualPage';
import Login from './Login'
import CurrentStory from './CurrentStory'

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {currentStoryID: -1, inProgressStoryID: -1}
        this.setCurrentStory = this.setCurrentStory.bind(this);
        this.setCurrentInProgressStory = this.setCurrentInProgressStory.bind(this);
    }

    setCurrentStory = (id) => {
        this.setState({currentStoryID: id});
    }
    setCurrentInProgressStory = (id) => {
        this.setState({inProgressStoryID: id})
    }

    render() {
        return (
            <Router>
                <TopBar/>
                <Route exact path='/'>
                    <Home setCurrentInProgressStory={this.setCurrentInProgressStory}/>
                </Route>
                <Route exact path="/login">
                    <Login
                        isLogin={true}/>
                </Route>
                <Route path="/register">
                    <Login
                        isLogin={false}/>
                </Route>
                <Route path='/createstory'>
                    <CreateStory/>
                </Route>
                <Route path='/contribute'>
                    <CurrentStory/>
                </Route>
                <Route path='/completedStories'>
                    <CompletedStoryList
                        setCurrentStory={this.setCurrentStory}
                        id={this.state.currentStoryID}/>
                </Route>
                <Route path='/completeStory'>
                    <CompletedStoryIndividualPage
                        id={this.state.currentStoryID}/>
                </Route>
            </Router>)
    }

}
