import React from 'react'
import { Container, Button } from 'reactstrap'
import { Link, useHistory, Redirect, Route } from "react-router-dom";
import Home from './home'

export default class Login extends React.Component {

    constructor(props) {
        super(props)
        this.login = this.login.bind(this)
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

    render() {

        return (
        <div id="wrapperDiv">
            <Container id="mainDiv" style={{textAlign: "center"}}>
                <h1 className="mt-5 mb-10" style={{color: "#ffffff"}}>Unify</h1>

                <Link to="/home">
                    <Button className="btn btn-lg btn-block" style={{backgroundColor: "#1DB954", border: "none", outline: "none"}} onClick={this.login}>
                        Login
                    </Button>
                </Link>

            </Container>
        </div>
        )
    }
}