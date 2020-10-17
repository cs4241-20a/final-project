import React from 'react'
import {Container, Row, Col, Carousel} from 'react-bootstrap'
import FadeIn from 'react-fade-in'
import {Redirect} from 'react-router-dom'
import {GoogleLogin} from 'react-google-login'
import {withRouter} from 'react-router-dom'
import CanvasDraw from 'react-canvas-draw'

import API from '../API'

function saveImage() {
	const images = []
	var sourceCanvases = document.getElementsByTagName('canvas')
	for (let i = 1; i < sourceCanvases.length; i+=4){
		var destinationCanvas = document.createElement('canvas')
		destinationCanvas.height = sourceCanvases[i].height
		destinationCanvas.width = sourceCanvases[i].width

		var destinationContext = destinationCanvas.getContext('2d')

		destinationContext.drawImage(sourceCanvases[i], 0, 0)
		destinationContext.globalCompositeOperation = 'destination-over'
		destinationContext.fillStyle = 'black'
		destinationContext.fillRect(0, 0, destinationCanvas.width, destinationCanvas.height)
		images.push(destinationCanvas.toDataURL('image/png'))
	}
	console.log(images)
	return images
}

const responseGoogle = (response) => {
	console.error(response)
}

const login_callback = (response) => {
	const token = response.tokenId
	API.authenticate(token)
}

class Home extends React.Component {
	constructor(){
		super()
		this.state = { title_anim: false, anim_state: 0, authenticated: API.authenticated }
		this.quote_ref = React.createRef()
		this.login_button = 
		(<GoogleLogin
			clientId="772498714969-serroucg6ud4ns0038efpc5gdsefgm8d.apps.googleusercontent.com"
			buttonText="Login with Google"
			onSuccess={login_callback}
			onFailure={responseGoogle}
			cookiePolicy={'single_host_origin'}
		/>)
		this.on_file_upload = this.on_file_upload.bind(this)
		this.items = null
	}

	on_file_upload(user){
		if(!('/user' in this.props.states))
			this.props.states['/user'] = {}
		this.props.states['/user'].selected = user
		setTimeout(() => {this.setState({redirect: true})}, 0)
	}

	async componentDidMount(){
		API.add_auth_listener(() => {
			this.setState({authenticated: true, car: 0})
		})
		API.get_carousel().then((item_datas) => {
			this.items = item_datas.data.map((item, i) => {
				return <CanvasDraw key={i} saveData={item.canvas_data} hideGrid={true} disabled={true} hideInterface={true} immediateLoading={true} />
			})
			this.setState({carousel_items: item_datas.data, car: 1},  () => {setTimeout(() => {const images = saveImage()
				this.setState({car: 2, images: images})}, 100)})
		})
		let state = this.props.states[this.props.location.pathname]
		if(state !== undefined){
			await this.setState(state)
		}
		// if(!this.state.title_anim) {
		// 	this.title_animation()
		// }
	}

	get_carousel(){
		if(this.state.images == null)
			return null
		console.log(this.state.carousel_items)
		const items = this.state.carousel_items.map((item, i) => {
			return (<Carousel.Item key={i}>
				<img
					className="carousel-img"
					src={this.state.images[i]}
					alt={item.title}
				/>
				<Carousel.Caption>
					<h3><i>&quot;{item.title}&quot;</i></h3>
					<p><i>by <strong>{item.artist}</strong></i></p>
				</Carousel.Caption>
			</Carousel.Item>)
		})
		return <Carousel>{items}</Carousel>
	}

	componentWillUnmount(){
		const {pathname} = this.props.location
		this.props.states[pathname] = this.state
		Object.assign(this.props.states[pathname], {title_anim: true, anim_state: 2, redirect: false})
	}

	render() {
		let login_button = null
		let redirect = null
		let items = null
		if (this.state.car != 2)
			items = this.items
		if(!this.state.authenticated){
			login_button = this.login_button
		}

		if(this.state.redirect === true){
			redirect = <Redirect from="/" to="/user"/>
		}

		const carousel = this.get_carousel()

		return (
			<div>
				<FadeIn><h1 className="text-center the-title">Drawsome</h1></FadeIn>
				<FadeIn>{carousel}</FadeIn>
				<Container fluid>
					<Row className="justify-content-md-center">
						<Col id="login-button" className="text-center">{login_button}</Col>
					</Row>
					{redirect}
				</Container>
				<div style={{display: 'hidden'}} className="get-rid-of-me">
					{items}
				</div>
			</div>
		)
	}
}

export default withRouter(Home)