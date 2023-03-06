import WebSocket from 'ws'

import close from './close'

const PING_INTERVAL = 5000

const keepAlive = (socket: WebSocket) => {
	let alive = true

	const interval = setInterval(() => {
		alive ? socket.ping() : close(socket)
		alive = false
	}, PING_INTERVAL)

	socket.on('pong', () => {
		alive = true
	})

	socket.on('close', () => {
		clearInterval(interval)
	})
}

export default keepAlive
