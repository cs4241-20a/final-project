import React from 'react'
import { Container, Row, Col, Modal, Button } from 'react-bootstrap'
import { XSquareFill, Pencil } from 'react-bootstrap-icons'
import {Redirect} from 'react-router-dom'
import API from '../API'
import CanvasDraw from 'react-canvas-draw'

function DeleteModal(props) {
	const [show, setShow] = React.useState(false)
	const id = props.id
	const title = props.title
	const on_delete = props.delete_callback
	const handleClose = () => setShow(false)
	const handleShow = () => setShow(true)
	const handleDelete = () => {
		setShow(false)
		API.delete_drawing(id).then(() => {
			if(on_delete){on_delete()}

		})
	}

	return (
		<>
			<XSquareFill width="32" height="32" onClick={handleShow} className="delete-btn"/>
			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Drawing Deletion: <strong>{title}</strong></Modal.Title>
				</Modal.Header>
				<Modal.Body>Are you sure you want to delete this masterpiece? ({title})</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
            No
					</Button>
					<Button variant="danger" onClick={handleDelete}>
            Yes
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	)
}

class DrawingFeedItem extends React.Component {
	constructor(props){
		super(props)
		const {user_id, artist, title, canvas_data, published, _id } = this.props.data
		let owned
		if(API.user && API.user._id)
			owned = (API.user._id == user_id)
		this.state = {artist: artist, title: title, canvas_data: canvas_data, published: published, _id: _id,
			authenticated: false, owned: owned, redirect: false, deleted: false}
		this.on_delete = this.on_delete.bind(this)
	}

	on_delete(){
		this.setState({deleted: true})
	}

	async componentDidMount(){
		API.add_auth_listener(async (user) => {
			await this.setState({authenticated: true, owned: this.props.data.user_id == user._id})
		})
		this.canvas.loadSaveData(this.state.canvas_data)
		this.canvas.loadTimeOffset = 100
	}

	render(){
		if(this.state.deleted)
			return null
		let edit_btn = null
		let delete_btn = null
		let redirect = null
		const id = this.state._id
		if (this.state.owned){
			edit_btn = <Pencil width={32} height={32} style={{cursor: 'pointer'}} onClick={() => {this.setState({redirect: true})}}/>
			delete_btn = 	<DeleteModal id={this.state._id} title={this.state.title} delete_callback={this.on_delete} />

		}
		if(this.state.redirect)
			redirect = <Redirect to={{pathname: `/draw/${id}`, state: Object.assign(this.state, {redirect: false})}}/>

		return (
			<Container className="draw-view-container">
				<Row>
					<Col xs={{span: 3, offset: 4}} className="text-center">
						<h2><i>{this.state.title}</i></h2>
						<h5><i>by <strong>{this.state.artist}</strong></i></h5>
					</Col>
					<Col xs={1}>{edit_btn}</Col>
					<Col xs={1}>{delete_btn}</Col>
				</Row>
				<Row>			
					<Col>
						<div className="draw-view shadow-lg" onMouseEnter={() => {this.canvas.loadSaveData(this.state.canvas_data)}}>
							<CanvasDraw ref={canvasDraw => (this.canvas = canvasDraw)} className="draw-view" hideGrid={true} disabled={true} canvasWidth={400} canvasHeight={400}
							// onChange={(canvas) => { debugger; this.setState({canvas_data: canvas.getSaveData()})}}
								loadTimeOffset={10}
							/>
						</div>
					</Col>
				</Row>
				{redirect}
			</Container>

		)
	}
}

export default DrawingFeedItem