import React from 'react'
import {Container, Row, Col} from 'react-bootstrap'
import {withRouter} from 'react-router-dom'
import ContentFeed from '../components/content_feed'
import DrawingFeedItem from '../components/drawing_feed_item'

import API from '../API'

class UserDrawings extends React.Component {
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
					<Col><h1 id="title-string">My Drawings</h1></Col>
				</Row>
				<Row className="justify-content-center">
					<Col>
						<ContentFeed feed_path="/drawings/feed/user" ItemRender={DrawingFeedItem}/>
					</Col>
				</Row>
			</Container>)
	}
}

export default withRouter(UserDrawings)