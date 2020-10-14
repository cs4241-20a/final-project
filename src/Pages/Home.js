import React, { Component } from 'react'
import Demo from "../Components/Demo";

export class Home extends Component {
    render() {
        return (
            <div>
                <header>
                    <h1>Home</h1>
                    <Demo />
                </header>
            </div>
        )
    }
}

export default Home
