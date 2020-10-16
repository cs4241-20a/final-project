const WebSocket = require('ws')
const http = require('http')
const express  = require( 'express' ),
      app      = express(),
//const wss = new WebSocket.Server({ noServer: true })
const setupWSConnection = require('./node_modules/y-websocket/bin/utils.js').setupWSConnection

const port = process.env.PORT || 1234

const server = http.createServer(app)

app.use( express.static( 'build' ) )

const wss = new WebSocket.Server({ server })

wss.on('connection', setupWSConnection)

server.on('upgrade', (request, socket, head) => {
  // You may check auth of request here..
  /**
   * @param {any} ws
   */
  const handleAuth = ws => {
    wss.emit('connection', ws, request)
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

server.listen(port)

console.log('running on port', port)
