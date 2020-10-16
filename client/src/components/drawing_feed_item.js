import React from 'react'

class DrawingFeedItem extends React.Component {
	constructor(props){
		super(props)
		this.state = {data: this.props.data}
	}

	render(){
		const {data} = this.state
		if (data == null)
			return null
		return <p>{JSON.stringify(data)}</p>
	}
}

export default DrawingFeedItem