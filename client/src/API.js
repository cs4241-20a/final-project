import Axios from 'axios'

// const baseURL = 'http://brycecorbitt.ddns.net/a3-brycecorbitt'

const axios  = Axios.create({
	withCredentials: true,
	headers: {
		Accept: 'application/json'
	},
	baseURL: 'http://localhost:40404'
})

const handle_error = function(err){
	try {
		const caller = (new Error()).stack.split('\n')[2].trim().split(' ')[1]
		console.error(`Error in API.${caller}: ${err}`)
	}
	catch(nan){
		console.error('An unexpected error occured in API.\n', err)
	}
}


class API {
	constructor(){
		this.base_url = 'http://localhost:40404'
		this.auth_url = '/auth/callback'
		this.auth_check_url = '/auth/check'
		this.authenticated = false
		this.auth_callbacks = []
		this.user = null
	}

	authenticate(token){
		let params = {id_token: token}
		this.get(this.auth_url, {params: params}).then((res) => {
			if(res.status !== 200) {
				console.error(res.data)
				return
			}
			this.auth_callback(res.data)
		})
	}

	check_auth(){
		this.get(this.auth_check_url).then(res => {
			if(res.status === 200 && res.data.authenticated !== false){
				this.auth_callback(res.data)
			}
		}).catch(handle_error)
	}

	add_auth_listener(fcn){
		if(this.authenticated){
			fcn(this.user)
			return
		}
		this.auth_callbacks.push(fcn)
	}

	auth_callback(user){
		this.user = user
		this.authenticated = true
		this.auth_callbacks.forEach(fcn => {
			fcn(user)
		})
	}

	async get(url, params={}){
		return await axios.get(url, params).catch(handle_error)
	}

	async post(url, data, params={}){
		params = Object.assign({headers: { 'Content-Type': 'application/json' }}, params)
		return await axios.post(url, data, params).catch(handle_error)
	}

	async put(url, data, params={}){
		params = Object.assign({headers: { 'Content-Type': 'application/json' }}, params)
		return await axios.put(url, data, params).catch(handle_error)
	}

	async delete(url, params={}){
		return await axios.delete(url, params).catch(handle_error)
	}

	async *pager(url, page=1, limit=10) {
		while (true) {
			const params = {params: {page: page, limit: limit}}
			const result = await this.get(url, params)
			page++

			if(result.status != 200) {
				handle_error(result.data)
				return []
			}
			if(result.data.length < limit) {
				return result.data
			}

			yield result.data
		}
		
	}

	async get_user(){
		const result = await this.get('/auth/user')
		if('error' in result || result.status !== 200) {
			return undefined
		}
		if(!this.authenticated) {
			this.authenticate(result.data.user)
		}
	}

	async submit_file(uploader, title, file) {
		const params = {headers: {'Content-Type': 'multipart/form-data'}}
		const form = new FormData()
		form.append('uploader', uploader)
		form.append('title', title)
		form.append('file', file)
		return await this.post('/uploads', form, params).catch(handle_error)
	}

	async update_file(id, uploader, title){
		const url = '/uploads/' + id
		const data = {uploader: uploader, title: title}
		return await this.put(url, data).catch(handle_error)
	}

	async get_drawing(id){
		const url = '/drawings/' + id
		return await this.get(url).catch(handle_error)
	}

	async submit_drawing(artist, title, canvas_data, published=false) {
		const data = {artist: artist, title: title, canvas_data: canvas_data, published: published}
		return await this.post('/drawings', data).catch(handle_error)
	}

	async update_drawing(id, artist, title, canvas_data, published){
		const url = '/drawings/' + id
		const data = {artist: artist, title: title, canvas_data: canvas_data, published: published}
		return await this.put(url, data).catch(handle_error)
	}

	async delete_drawing(id){
		const url = '/drawings/' + id
		const res = await this.delete(url)
		if(res.status != 200) {
			handle_error(res.data)
			return false
		}
		return true
	}

	async sign_out(){
		if(!this.authenticated) {
			return true
		}
		return this.get('/auth/signout').then((res) => {
			if (res.status != 200)
				return false
			this.authenticated = false
			this.user = null
			return true
		})
	}

	async delete_upload(id){
		const url = '/uploads/' + id
		const res = await this.delete(url)
		if(res.status != 200) {
			handle_error(res.data)
			return false
		}
		return true
	}

}

export default new API()