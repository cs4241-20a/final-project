import React from 'react'
import {Form, Button} from 'react-bootstrap'

import API from '../API'


class FileUpload extends React.Component {
	constructor(){
		super()
		this.state = {file: null}
		this.form = React.createRef()
		this.onFormSubmit = this.onFormSubmit.bind(this)
		this.onChange = this.onChange.bind(this)
	}

	componentDidMount(){
		API.add_auth_listener((user) => {
			const input = document.getElementById('uploader')
			input.value = user.name
		})
	}

	onChange(e) {
		this.setState({file:e.target.files[0]})
	}

	async onFormSubmit(e){
		e.preventDefault()
		const [uploader, title] = ['uploader', 'title'].map((name) => document.getElementById(name).value)
		const file = this.state.file
		let response = await API.submit_file(uploader, title, file)
		if(response.status == 201 && this.props.on_file_upload){
			this.props.on_file_upload(response.data)
		}
	}

	render() {
		return (
			<Form className="shadow-lg" ref={this.form} onSubmit={this.onFormSubmit}>
				<h2>Upload New File</h2>
				<Form.Group controlId="uploader">
					<Form.Label className="required">Your Name</Form.Label>
					<Form.Control type="text" name="uploader" required/>
				</Form.Group>
				<Form.Group controlId="title">
					<Form.Label className="required">Upload Title</Form.Label>
					<Form.Control type="text" name="title" required placeholder="Something creative ;)" />
				</Form.Group>
				<Form.Group controlId="file">
					<Form.Label className="required">Upload your file!</Form.Label>
					<Form.Control type="file" name="file" required className="file-upload" onChange={this.onChange}/>
				</Form.Group>
				<Button variant="primary" type="submit">
					Submit
				</Button>
			</Form>
		)
	}
}

export default FileUpload