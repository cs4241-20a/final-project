import React from 'react'
import {Container, Row, Col, Jumbotron} from 'react-bootstrap'
import FadeIn from 'react-fade-in'
import TypeIt from 'typeit'
import {Redirect} from 'react-router-dom'
import {GoogleLogin} from 'react-google-login'
import {withRouter} from 'react-router-dom'

import API from '../API'
import FileUpload from '../components/file_upload'

const responseGoogle = (response) => {
	console.error(response)
}

const login_callback = (response) => {
	const token = response.accessToken
	API.authenticate(token)
}

class Home extends React.Component {
	constructor(){
		super()
		this.state = { title_anim: false, anim_state: 0, authenticated: API.authenticated }
		this.quote_ref = React.createRef()
		this.title_block = (<h1 id="title-string">Drive++ <em>with <strong>React</strong></em></h1>)
		this.quote_block = (<blockquote className="blockquote text-muted" ref={this.quote_ref}>
			<h3><i>{'Possibly the most attractive landing page I\'ve ever created.'}</i></h3>
			<footer className="blockquote-footer">Bryce Corbitt</footer>
		</blockquote>)
		this.login_button = 
		(<GoogleLogin
			clientId="772498714969-serroucg6ud4ns0038efpc5gdsefgm8d.apps.googleusercontent.com"
			buttonText="Login with Google"
			onSuccess={login_callback}
			onFailure={responseGoogle}
			cookiePolicy={'single_host_origin'}
		/>)
		this.on_file_upload = this.on_file_upload.bind(this)
	}

	on_file_upload(user){
		if(!('/user' in this.props.states))
			this.props.states['/user'] = {}
		this.props.states['/user'].selected = user
		setTimeout(() => {this.setState({redirect: true})}, 0)
	}

	title_animation(){
		let ti = new TypeIt('#title-string', {
			speed: 100,
			startDelay: 500,
			afterComplete: () => {
				ti.reset()
				this.setState({title_anim: true, anim_state: 1, redirect: false})
			}
		})
		ti
			.type('Glitch Drive', {delay: 400})
			.move(-5, {speed: 125})
			.delete(7, {speed: 125})
			.move('END', {delay: 100})
			.type('++', {delay:800})
			.delete(1)
			.type('=2', {delay:100})
			.type('?', {delay:400})
			.delete(3)
			.type('+', {delay:300})
			.type(' <em>with </em>')
			.type('<em><strong>React</strong></em>', {speed: 200, delay: 500})
			.go()
	}

	async componentDidMount(){
		API.add_auth_listener(() => {
			this.setState({authenticated: true})
		})
		let state = this.props.states[this.props.location.pathname]
		if(state !== undefined){
			await this.setState(state)
		}
		if(!this.state.title_anim) {
			this.title_animation()
		}
	}

	componentWillUnmount(){
		const {pathname} = this.props.location
		this.props.states[pathname] = this.state
		Object.assign(this.props.states[pathname], {title_anim: true, anim_state: 2, redirect: false})
	}

	render() {
		let title_txt = <h1 id="title-string"></h1>
		let login_button = null
		let redirect = null
		let upload_form = <FadeIn><FileUpload on_file_upload={this.on_file_upload}/></FadeIn>
		if(!this.state.authenticated){
			login_button = this.login_button
			upload_form = null
		}

		if(this.state.redirect === true){
			redirect = <Redirect from="/" to="/user"/>
		}

		let quote_block
		switch(this.state.anim_state) {
		case 0:
			quote_block = <div className="hidden-but-still-take-up-space">{this.quote_block}</div>
			break
		case 1:
			quote_block = <FadeIn transitionDuration={1000}>{this.quote_block}</FadeIn>
			title_txt = this.title_block
			break
		default:
			quote_block = this.quote_block
			title_txt = this.title_block
			break
		}

		return (
			<div>
				<Jumbotron fluid>
					{title_txt}
					{quote_block}
				</Jumbotron>
				<Container fluid>
					<Row className="justify-content-md-center">
						<Col id="login-button" className="text-center">{login_button}</Col>
					</Row>
					<Row className="justify-content-md-center">
						<Col id="upload-form">{upload_form}</Col>
					</Row>
					{redirect}
				</Container>
			</div>
		)
	}
}

export default withRouter(Home)