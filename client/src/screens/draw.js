import React from 'react'
import {Container, Row, Col, Button} from  'react-bootstrap'
import CanvasDraw from 'react-canvas-draw'

class DrawScreen extends React.Component {
	constructor(props){
		super(props)
		this.state = {appear: true}
	}

	componentDidMount(){
		console.log('hi')
	}

	componentWillUnmount(){
		console.log('bye')
	}

	render(){
		let button = (<Button variant="danger">I am here</Button>)
		if(!this.state.appear)
			button = null
		return (
			<Container>
				<Row>
					<Col xs={{offset: 4}}>
						<Button  variant="success" onClick={() => { console.log(this.canvas.getSaveData())}}>Save</Button>
					</Col>
					<Col>
						<Button variant="info" onClick={() => {this.setState({appear: !this.state.appear})}}>Load</Button>
					</Col>
					<Col>
						{button}
					</Col>
				</Row>
				<Row>
					<Col className="text-center">
						<CanvasDraw ref={canvasDraw => (this.canvas = canvasDraw)} className="shadow-lg draw-canvas" hideGrid={true}/>
					</Col>
				</Row>
			</Container>
		)
	}

}

export default DrawScreen