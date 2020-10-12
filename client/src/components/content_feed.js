import React from 'react'
import {Spinner} from 'react-bootstrap'
import {withRouter} from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroller'

import FileView from '../components/file_view'
import API from '../API'

class ContentFeed extends React.Component {
	constructor(props){
		super(props)
		const auth_required = props.auth_required == undefined? true : props.auth_required
		this.state = {auth_required: auth_required, authenticated: false, items: [], has_more: true, is_loading: true}
		this.feed_path = props.feed_path
		this.generator = API.pager(props.feed_path)
		this.renderItems = this.renderItems.bind(this)
	}

	async componentDidMount(){

		API.add_auth_listener(async () => {
			await this.setState({authenticated: true})
		})
	}

	async page(){
		const entries = await this.generator.next()
		const items = this.state.items.concat(entries.value)
		this.setState({ items: items, has_more: !entries.done})
	}

	renderItem(key, data){
		if(!data)
			return null
		return <div key={key}><FileView data={data}/></div>
	}

	renderItems(){
		if(!this.state.items || this.state.items === []){
			return null
		}
		const {items} = this.state
		const buffer = []
		for (let i = 0; i < items.length; i++){
			buffer.push(this.renderItem(i, items[i]))
		}
		return buffer
	}

	render() {
		let feed = null
		let items = null
		if(this.state.authenticated || !this.state.auth_required) {
			items = this.renderItems()
			feed = (
				<div id="feed" style={{height: '100%', overflow: 'auto'}} ref={(ref) => this.scrollParentRef = ref}>
					<InfiniteScroll
						pageStart={1}
						loadMore={this.page.bind(this)}
						hasMore={this.state.has_more}
						loader={<div className="text-center" key={-1}><Spinner animation="border" variant="dark"/></div>}
						getScrollParent={() => this.scrollParentRef}
						threshold={10}

					>
						{items}
					</InfiniteScroll>
				</div>
			)
		}
		return feed
	}
}

export default withRouter(ContentFeed)