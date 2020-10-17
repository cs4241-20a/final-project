import React, {useState} from 'react'
import {Container, Row, Col, Image, Table, Accordion, Button, Modal } from 'react-bootstrap'
import {CaretRightFill, CaretDownFill, Download, XSquareFill, Pencil, X, Check} from 'react-bootstrap-icons'
import Box from '@material-ui/core/Box'
import API from '../API'
import FadeIn from 'react-fade-in'

function DeleteModal(props) {
	const [show, setShow] = useState(false)
	const id = props.id
	const name = props.name
	const title = props.title
	const on_delete = props.delete_callback
	const handleClose = () => setShow(false)
	const handleShow = () => setShow(true)
	const handleDelete = () => {
		setShow(false)
		API.delete_upload(id).then((result) => {
			if(result == true){
				if(on_delete != undefined){
					on_delete()
				}
			}
		})
	}

	return (
		<>
			<XSquareFill width="32" height="32" onClick={handleShow} className="delete-btn"/>
			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Upload Deletion: <strong>{title}</strong></Modal.Title>
				</Modal.Header>
				<Modal.Body>Are you sure you want to delete {name}?</Modal.Body>
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

class FileView extends React.Component {
	constructor(props) {
		super(props)
		this.data = props.data
		
		this.data.created_at = new Date(Date.parse(props.data.created_at)).toLocaleString()
		this.data.updated_at = new Date(Date.parse(props.data.updated_at)).toLocaleString()

		this.state = { editable: false, editing: false, deleted: false, table_shown: false, data: this.data, title: this.data.title, uploader: this.data.uploader}
		this.delete = this.delete.bind(this)
		this.edit = this.edit.bind(this)
		this.titleInput = (<input type="text" className="title-input" defaultValue={this.state.title} onChange={(e) => {this.setState({title: e.target.value})}}/>)
		this.uploaderInput = (<input type="text" className="uploader-input" defaultValue={this.state.uploader} onChange={(e) => {this.setState({uploader: e.target.value})}}/>)
	}

	delete(){
		this.setState({deleted: true})
	}

	async edit(){
		const title = this.state.title
		const uploader = this.state.uploader
		const id = this.data.id
		const result = await API.update_file(id, uploader, title)
		result.data.created_at = new Date(Date.parse(result.data.created_at)).toLocaleString()
		result.data.updated_at = new Date(Date.parse(result.data.updated_at)).toLocaleString()
		await this.setState({data: result.data, editing: false})
	}

	componentDidMount(){
		API.add_auth_listener((user)=>{
			if(user._id == this.state.data.uploader_id){
				this.setState({editable: true})
			}
		})
	}

	render(){
		const state = this.state
		if(this.state.deleted == true) {
			return null
		}
		let {download_path, title, uploader, mime_type, file_name} = this.state.data
		// download_path = API.base_url + download_path

		const tbl_columns = {'title': 'Post Title', 'uploader': 'Uploader Name', 'id': 'Id', 'file_name': 'File Name', 'mime_type': 'Mimetype', 'size_formatted': 'Size', 'created_at': 'Upload Timestamp'}
		const tbl_data = {}
		let accordion_head = <p><CaretRightFill/> Display attributes</p>
		let table_buffer = []
		Object.keys(tbl_columns).forEach(key => {
			tbl_data[key] = state.data[key]
			table_buffer.push(<tr key={key}><td><strong>{tbl_columns[key]}</strong></td><td>{tbl_data[key]}</td></tr>)
		})
		if(this.state.table_shown)
			accordion_head = <p><CaretDownFill/> Hide attributes</p>
		
		let delete_btn = null
		let edit_controls = null
		let header = (<>
			<h3>{title}</h3>
			<p className="uploader-name">{uploader}</p>
		</>
		)

		if(this.state.editable){
			delete_btn = <Col><DeleteModal id={tbl_data.id} name={tbl_data.file_name} title={title} delete_callback={this.delete}/></Col>
			edit_controls = (<div as={Button}><Pencil cursor="pointer" className="text-success" width="32" height="32" onClick={() => {this.setState({editing: true})}}/></div>)

			if(this.state.editing){
				header = (<>
					{this.titleInput}
					<p>Uploader: {this.uploaderInput}</p>
				</>)
				edit_controls = (<>
					<div as={Button}><X cursor="pointer" className="text-danger" width="32" height="32" onClick={() => {this.setState({editing: false})}}/></div>
					<div as={Button}><Check cursor="pointer" className="text-success" width="32" height="32" onClick={this.edit}/></div>
				</>)
			}
		}

		let type = mime_type.substring(0, mime_type.indexOf('/'))
		let item_display = null
		switch(type) {
		case 'audio':
			item_display = <audio controls className='audio-preview' src={download_path}/>
			break
		case 'video':
			item_display = <video controls className='video-preview' src={download_path}/>
			break
		case 'image':
			item_display = <Image className='image-preview img-fluid' src={download_path}/>
			break
		default:
			item_display = <Image className='image-preview img-fluid' src={'/file_icon.png'}/>

		}
		
		return (
			<FadeIn>
				<Box borderRadius="10px" border={1} className="shadow">
					<Container className="panel">
						<Row className=".row-centered">
							<Col className="panel-header">
								<Row>
									<Col className="col">
										<div className="d-flex flex-row">
											<div className="p-2 mr-2">{header}</div>
											<div className="p-2 edit-controls">{edit_controls}</div>
										</div>

									</Col>

									<Col xs="auto" className="float-right">
										<Row>
											<Col><a download={file_name} href={download_path}><Download width="32" height="32"/></a></Col>
											{delete_btn}
										</Row>
									</Col>
								</Row>
							</Col>
						</Row>
						<Row>
							<Col className="panel-display text-center">{item_display}</Col>
						</Row>
						<Row>
							<Col className="panel-footer">
								<Accordion>
									<Accordion.Toggle as={Button} variant="link" eventKey="0" onClick={() => {this.setState({table_shown: !this.state.table_shown})}}>
										{accordion_head}
									</Accordion.Toggle>
									<Accordion.Collapse eventKey="0">
										<Table>
											<tbody>
												{table_buffer}
											</tbody>
										</Table>
									</Accordion.Collapse>
								</Accordion>
								
							</Col>
						</Row>
					</Container>
				</Box>
			</FadeIn>
		)
	}
}

export default FileView