import React from 'react'
import {Container, Row, Col, Button, Form} from  'react-bootstrap'
import CanvasDraw from 'react-canvas-draw'
import {Redirect} from 'react-router-dom'
import {HuePicker} from 'react-color'

import API from '../API'

class DrawScreen extends React.Component {
	constructor(props){
		super(props)
		this.state ={
			color: '#ff0000',
			secondColor: '#ff0000',
			eraser: false,
			published: false,
			brushRadius: 10,
			appear: true,
			redirect: false,
		}

		if(props.location && props.location.state)
			Object.assign(this.state, props.location.state)
					
		
		this.form = React.createRef()
		this.onFormSubmit = this.onFormSubmit.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.handleChangeComplete = this.handleChangeComplete.bind(this)
			
		this.titleInput = (<input type="text" className="title-input" required={true} defaultValue={this.state.title} onChange={(e) => {this.setState({title: e.target.value})}}/>)
		this.artistInput = (<input type="text" className="artist-input" required={true} defaultValue={this.state.artist} onChange={(e) => {this.setState({artist: e.target.value})}}/>)
	}

	componentDidMount(){
		console.log('hi')
		if(this.state.canvas_data) {
			this.saveableCanvas.loadSaveData(this.state.canvas_data)
			localStorage.setItem(
				'savedDrawing',
				this.state.canvas_data
			)
		}
	}

	componentWillUnmount(){
		console.log('bye')
	}

	handleChangeComplete (colors){
		this.setState({color:colors.hex, secondColor:colors.hex})
	}

	async onFormSubmit(e){
		e.preventDefault()
		const content = this.saveableCanvas.getSaveData()
		const {artist, title, published} = this.state
		let response
		if(!this.state._id)
			response = await API.submit_drawing(artist, title, content, published)
		else
			response = await API.update_drawing(this.state._id, artist, title, content, published)
		
		if(response.status != 200 && response.status != 201 && response.status != 304){
			alert('Request Failed :(\n' + JSON.stringify(response.data))
			return
		}
		this.setState({redirect: true})

	}
    
	handleChange() {
		this.setState({published: !this.state.published}, () =>{
			console.log(this.state.published)
		})
        
	}
      
	render(){
		let redirect = null
		let eraserText = 'Erase'
		if (this.state.eraser)
			eraserText ='Draw'
		if(this.state.redirect){
			redirect = <Redirect to={{pathname: '/user'}}/>
		}
		return (
			<Container>
				<Row>
					<Col><h1 id="title-string">Draw</h1></Col>
				</Row>
                
				<Row>
					<Col>
					</Col>
					<Col>
						<div>
							<HuePicker
								color={this.state.color}
								onChangeComplete={this.handleChangeComplete}
							/>
						</div>
					</Col>
					<Col>
					</Col>
					<Col>
					</Col>
				</Row>
				<Row>
					<Col>
						<div className= "classNames tools">
                    
							<Button 
								style={{
									position: 'absolute',left:'90px',top:'0px'
								}}
								onClick={() => {
									this.setState({eraser: !this.state.eraser}, () => {
										if (this.state.eraser)
											this.setState({color: '#ffffff'})
										else this.setState({ color: this.state.secondColor})

									})}}
							>
								{eraserText}
							</Button>

							<Button variant="danger"
								style={{
									position: 'absolute',left:'-90px',top:'0px'
								}}
								onClick={() => {
									this.saveableCanvas.clear()
								}}
							>
                        Clear
							</Button>
							<Button variant="info"
								style={{
									position: 'absolute',left:'0px',top:'0px'
								}}
								onClick={() => {
									this.saveableCanvas.undo()
								}}
							>
                        Undo
							</Button>
                    
							<div>
								<div className="text"> 
                        Brush-Radius:
								</div>

								<input
									type="range"
									min="1"
									max="50"
									className="custom-range"
									value={this.state.brushRadius}
									onChange={e =>
										this.setState({ brushRadius: parseInt(e.target.value, 10) })
									}
									style={{
										position: 'absolute',left:'-110px',top:'90px'
									}}
								/>
							</div>
                    
							<div className="saveTitle">
								<h3>Save/Publish Drawing</h3>
							</div>

							<div className="form-group">
								<Form className="form-group" ref={this.form} onSubmit={this.onFormSubmit}>
                        
									<div className="name">
										<Form.Group controlId="name">
											<Form.Label className="required">Your Name</Form.Label>
											{/* <Form.Control type="text" name="name" required/> */}
											{this.artistInput}
										</Form.Group>
									</div>

									<div className="title">
										<Form.Group controlId="title">
											<Form.Label className="required">Drawing Title</Form.Label>
											{/* <Form.Control type="text" name="title" required /> */}
											{this.titleInput}
										</Form.Group>
									</div>
                       
									<div className="submit">
										<Form.Switch 
											checked={this.state.published}
											onChange={this.handleChange}
											type="switch"
											id="custom-switch"
											label="Publish"
										/>
									</div>

									<Button variant="success" type="submit"
										style={{
											position: 'absolute',left:'70px',top:'250px'
										}}
										onClick={() => {
											localStorage.setItem(
												'savedDrawing',
												this.saveableCanvas.getSaveData()
											)
										}}
									>
                                Save
									</Button>
								</Form>

							</div>
                   
						</div>
					</Col>
               
					<Col className="text-center">
						<CanvasDraw className="shadow-lg draw-canvas" hideGrid={true}
							ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
							brushColor={this.state.color}
							brushRadius={this.state.brushRadius}
							canvasHeight={this.state.height}
							canvasWidth={this.state.width}
							style={{
								position: 'absolute',left:'-20px',top:'0px'
							}}
						/>
					</Col>

					<Col>
						<Button variant = "success"
							style={{
								position: 'absolute',left:'325px',top:'-50px'
							}}
							onClick={() => {
								this.loadableCanvas.loadSaveData(
									localStorage.getItem('savedDrawing')
								)
							}}
						>
                    Playback of Saved Drawing
						</Button>
						<CanvasDraw className="shadow-lg draw-canvas" hideGrid={true}
							disabled
							ref={canvasDraw => (this.loadableCanvas = canvasDraw)}
							saveData={localStorage.getItem('savedDrawing')}
							style={{
								position: 'absolute',left:'215px',top:'0px'
							}}
						/>
					</Col>
					<Col>
					</Col>
				</Row>
				<Row>
					{redirect}
				</Row>
			</Container>
		)
	}

}

export default DrawScreen