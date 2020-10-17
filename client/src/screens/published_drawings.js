import React from 'react'
import {Container, Row, Col} from 'react-bootstrap'
import {withRouter} from 'react-router-dom'
import ContentFeed from '../components/content_feed'
import DrawingFeedItem from '../components/drawing_feed_item'

import API from '../API'

class Gallery extends React.Component {
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
					<Col><h1 id="title-string">Art Gallery</h1></Col>
				</Row>
				<Row className="justify-content-center">
					<Col>
						<ContentFeed auth_required={false} feed_path="/drawings/feed/" ItemRender={DrawingFeedItem}/>
					</Col>
				</Row>
			</Container>)
	}
}

export default withRouter(Gallery)