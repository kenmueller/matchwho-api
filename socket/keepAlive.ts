import WebSocket from 'ws'

const PING_INTERVAL = 5000

const keepAlive = (socket: WebSocket) => {
	const interval = setInterval(() => {
		socket.ping()
	}, PING_INTERVAL)

	socket.on('close', () => {
		clearInterval(interval)
	})
}

export default keepAlive
