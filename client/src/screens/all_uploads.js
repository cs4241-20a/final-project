import React from 'react'
import {Container, Row, Col} from 'react-bootstrap'
import {withRouter} from 'react-router-dom'
import ContentFeed from '../components/content_feed'

import API from '../API'

class AllUploads extends React.Component {
	constructor(props){
		super(props)
		this.state = {authenticated: false}
	}

	async componentDidMount(){

		API.add_auth_listener(async () => {
			await this.setState({authenticated: true})
		})
	}

	render() {
		return (
			<Container fluid>
				<Row>
					<Col><h1 id="title-string">All Uploads</h1></Col>
				</Row>
				<Row className="justify-content-center">
					<Col>
						<ContentFeed feed_path="/uploads" auth_required={false}/>
					</Col>
				</Row>
			</Container>)
	}
}

export default withRouter(AllUploads)