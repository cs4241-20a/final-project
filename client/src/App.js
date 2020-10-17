import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import { createBrowserHistory } from 'history'
import {
	HashRouter as Router,
	Switch,
	Route,
	NavLink,
} from 'react-router-dom'

import API from './API'
import Home from './screens/home'
import UserDrawings from './screens/user_drawings'
import Gallery from './screens/published_drawings'
import DrawScreen from './screens/draw'

import 'bootswatch/dist/sketchy/bootstrap.min.css'
import './App.css'

const history = createBrowserHistory()
const states = {'/': {}, '/user': {}, '/uploads': {}}

class App extends React.Component{
	constructor(props){
		super(props)
		this.state = { authenticated: false }
		this.sign_out = this.sign_out.bind(this)
	}

	shouldComponentUpdate(nextProps, nextState){
		if('authenticated' in nextState && nextState.authenticated != this.state.authenticated) {
			for(const key of Object.keys(states)){
				states[key]['authenticated'] = nextState.authenticated
			}
			return true
		}
	}

	componentDidMount(){
		API.check_auth()
		API.add_auth_listener((user) => {
			this.setState({authenticated: true, user_name: user.name})
		})
	}

	sign_out(){
		API.sign_out().then((result => {
			if(result === true){
				for(const key of Object.keys(states)){
					states[key]['authenticated'] = false
				}
				this.setState({authenticated: false}, () => {
					history.replace('/', {authenticated: false, title_anim: true, anim_state: 2})
					window.location.reload()
				})
			}
		})).catch(err => {console.error(err)})
	}

	render(){
		let my_uploads_link = null
		let name_display = null
		let sign_out = null
		const {user_name} = this.state
		if(this.state.authenticated) {
			my_uploads_link = (
				<Nav.Item>
					<Nav.Link as={NavLink} to="/user">My Drawings</Nav.Link>
				</Nav.Item>)
			const name_text = `Signed in as ${user_name}`
			name_display = <Navbar.Text id="display-name">{name_text}</Navbar.Text>
			sign_out = (
				<Nav.Item>
					<Nav.Link onClick={this.sign_out}>Sign Out</Nav.Link>
				</Nav.Item>
			)
		}
		return (
			<Router history={history}>
				<Navbar bg="primary" variant="dark" sticky="top" expand="md" animation="true">
					<Navbar.Brand as={NavLink} to="/">Drawsome</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse>
						<Nav className="mr-auto">
							<Nav.Item>
								<Nav.Link as={NavLink} exact to="/">Home</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link as={NavLink} to="/draw">Draw</Nav.Link>
							</Nav.Item>
							{my_uploads_link}
							<Nav.Item>
								<Nav.Link as={NavLink} to="/gallery">Gallery</Nav.Link>
							</Nav.Item>
							{name_display}
							{sign_out}
						</Nav>
					</Navbar.Collapse>
				</Navbar>
	
	
				{/* A <Switch> looks through its children <Route>s and
							renders the first one that matches the current URL. */}
				<Switch>
					<Route path="/user" render={(props) => (<UserDrawings {...props} states={states}/>)}/>
					<Route path="/gallery" render={(props) => (<Gallery {...props} states={states}/>)}/>
					<Route path="/draw" render={(props) => (<DrawScreen {...props} states={states}/>)}/>
					<Route path="/" exact render={(props) => (<Home {...props} states={states}/>)}/>
				</Switch>
			</Router>
		)
	}
}


export default App
