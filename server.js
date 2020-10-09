const express = require('express'),
      fetch = require('node-fetch'),
      bodyparser = require('body-parser'),
      cookie = require('cookie-session'),
      mongodb = require('mongodb'),
      mongoose = require('mongoose'),
      passport = require('passport')
      app = express()

// const client_id = process.env.GITHUB_CLIENT_ID
// const client_secret = process.env.GITHUB_CLIENT_SECRET
// const cookie_secret = process.env.COOKIE_SECRET
// const dbpass = process.env.DBPASSWORD

var StatsD = require('node-statsd')
var favicon = require('serve-favicon')
var path = require('path')


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// app.use(
//   cookie({
//     secret: cookie_secret
//   })
// );



app.use(express.static('public'))

// Mongodb Config
const uri = process.env.MONGO_URI
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
)
const connection = mongoose.connection
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

// Passport config
require('./config/passport.js')(passport)

// Bodyparser
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())

app.use(passport.initialize())
app.use(passport.session())

// User route
app.use('/users', require('./routes/users'))
app.use('/', require('./routes/index'))


const listener = app.listen( process.env.PORT || 3000, function() {
  console.log( 'Your app is listening on port ' + listener.address().port )
})

// async function getAccessToken(code){
//   const token_url = 'https://github.com/login/oauth/access_token'
//   const res = await fetch(token_url,{
//     method: 'POST',
//     headers:{
//       'Content-Type':'application/json'
//     },
//     body: JSON.stringify({
//         client_id,
//         client_secret,
//         code
//     })
//   })
//   const data = await res.text()
//   const params = new URLSearchParams(data)
//   return params.get('access_token')
// }

// async function getGithubUser(access_token){
//   const req = await fetch('https://api.github.com/user',{
//     headers:{
//       Authorization: `bearer ${access_token}`
//     }
//   })
//   const data = await req.json()
//   return data
// }

// app.get('/login/github/callback',async (request,response) => {
//   console.log('GET: ',request.url)
//   const code = request.query.code
//   const token = await getAccessToken(code)
//   const githubdata = await getGithubUser(token)
//   //check if user is authorized
//   if(githubdata){
//     request.session.githubId = githubdata.id
//     request.session.token = token
//     response.redirect('/')
//   }else{
//     response.send("Error: not authorized")
//   }
// })

// app.post('/logout',(request,response) =>{
//   request.session = null
//   response.clearCookie()
//   response.redirect('/login.html')
//   console.log("log out in server")
// })
// handling the get request
// app.get('/', function(request, response) {
//   console.log('GET: ',request.url)
  // if(request.session.githubId){
  //   response.sendFile( __dirname + '/public/index.html' )
  // }else{
  //   response.sendFile(__dirname + '/public/login.html') 
  // }
// })
// app.get('/githubid',function(request,response){
//   if(request.session.githubId){
//     response.send(JSON.stringify(request.session.githubId))
//     console.log("sent githubId:" + request.session.githubId)
//   }else{
//     response.send("User is not authorzied")
//   }
// })

//User login
// app.get('/login/github',(request,response) => {
//   const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri = http://localhost:3000/login/github/callback`
//   response.redirect(url)
// })
