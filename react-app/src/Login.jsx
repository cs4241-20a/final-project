import React, {Component} from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import './App.css';

const theme = createMuiTheme({
    spacing: 8,
    palette: {
      type: 'dark',
      primary: {
        main: "#7e57c2", //purple
      },
      secondary: {
        main: '#76ff03', //green
      },
    },
  });

export class Login extends Component {
    constructor(props) {
        super(props);
        if (props.isLogin) {
            this.buttonClick = this.login;
        } else {
            this.buttonClick = this.register;
        }

        this.state = {username: "", password: ""}
    }

    login(e) {
        console.log('login page button clicked')
        // prevent default form action from being carried out
        e.preventDefault()
    
        const username = this.username;
        const pass = this.password;
        let json = {
            username: username,
            password: pass
        };
        let body = JSON.stringify(json);
    
        fetch('/login', {
            method: 'POST',
            body: body,
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(function (response) {
                if (response.redirected === true) {
                    window.open(response.url, "_self")
                } else {
                    return response.json()
                }
    
            })
            .then(function (json) {
                let errmsg = document.getElementById('errormsg');
                if (json.error.toString() === 'password') {
                    errmsg.innerText = "Password Incorrect"
                } else { //username not found
                    errmsg.innerText = "Username not found"
                }
            })
    
        return false;
    }
    
    register(e) {
        console.log('register page button clicked')
    
        // prevent default form action from being carried out
        e.preventDefault()
    
        const username = this.username;
        const pass = this.password;
        let json = {
            username: username,
            password: pass
        };
        let body = JSON.stringify(json);
    
        fetch('/register', {
            method: 'POST',
            body: body,
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(function (response) {
                return response.json()
            })
            .then(function (json) {
                if (json.code === 'found') {
                    alert('This username already exists')
                } else {
                    window.open('/', "_self")
                }
            })
    
        return false;
    
    }

    setUsername(e){
        this.setState({username: e.target.value});
        this.checkIfFieldsEmpty();
      }
      setPassword(e){
        this.setState({password: e.target.value});
        this.checkIfFieldsEmpty();
      }

    checkIfFieldsEmpty() {
        //const inputs = document.querySelectorAll('.loginField');
        //for (let i = 0; i < inputs.length; i++) {
        //if (inputs[i].value === '') {
                //document.querySelector('#signin').disabled = true
               // return true
           // }
       // }
        if (this.username==='' || this.password===''){
            document.querySelector('#signin').disabled = true
            return true;
        }
        document.querySelector('#signin').disabled = false
        return false;
    }

    render() {
        return (
            <ThemeProvider theme={theme}>
            <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                <p id="errormsg"/>
                <div className="container" style={{"margin": "10px", display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                    <div>
                        <p id="errormsg"/>
                        <TextField style={{margin: theme.spacing(1)}} id="username" 
                            label="Username" type="text" placeholder="Username" 
                            variant="filled" className="loginField" margin="normal" InputLabelProps={{shrink: true}} 
                            value = {this.state.username}
                            onChange = {(event) => {this.setUsername(event)}}/>
                        <br/>
                        <TextField style={{margin: theme.spacing(1)}} id="password" 
                            label="Password" type="password" placeholder="Password" 
                            variant="filled" className="loginField" margin="normal" InputLabelProps={{shrink: true}} 
                            value = {this.state.password}
                            onChange = {(event) => {this.setPassword(event)}}/>
                        <br/>
                        <Button style={{margin: theme.spacing(1)}} id='signin' onClick={this.buttonClick}
                                variant="contained">{this.props.isLogin ? "Login" : "Signup"}</Button>

                        {this.props.isLogin ? (<div>
                        <p className="lowPriority">DON'T HAVE AN ACCOUNT?</p>
                        <a href="/register">
                            <p className="subtitle">
                                Sign Up
                            </p>

                        </a>
                    </div>) : ""}
                    <div className="lowPriority"><p>OR LOG IN WITH</p></div>
                    <div style={{justifyContent: 'center'}}>
                        <a href="/auth/github" target="_blank" rel="noopener noreferrer">
                            <img src="img/GitHub_Logo_White.png" alt="GitHub logo" style={{width: 250, height: 100}} />
                        </a>
                    </div>
                    </div>

                </div>
            </div>
            </ThemeProvider>
        )
    }
}

export default Login
