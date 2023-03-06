import WebSocket, { WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import { Socket } from 'net'
import Pattern from 'url-pattern'

import { server } from '../root'
import HttpError from '../error/http'
import ErrorCode from '../error/code'

type URLParams = Record<string, string>

export interface SocketRequest extends IncomingMessage {
	params: Record<string, string>
	query: URLSearchParams
}

export type SocketListener = (socket: WebSocket, req: SocketRequest) => void

const socketServers = new Map<Pattern, WebSocketServer>()

const socket = (path: string, listener: SocketListener) => {
	const socketServer = new WebSocketServer({ noServer: true })
	socketServer.on('connection', listener)

	socketServers.set(new Pattern(path), socketServer)
}

const upgrade = async (req: SocketRequest, socket: Socket, head: Buffer) => {
	try {
		const url = new URL(req.url ?? '', req.headers.origin)

		for (const [pattern, socketServer] of socketServers) {
			const params = pattern.match(url.pathname) as URLParams | null
			if (!params) continue

			req.params = params
			req.query = url.searchParams

			const client = await new Promise<WebSocket>(resolve => {
				socketServer.handleUpgrade(req, socket, head, resolve)
			})

			socketServer.emit('connection', client, req)
			return
		}

		throw new HttpError(ErrorCode.Socket, 'No matching paths')
	} catch (error) {
		socket.destroy(error instanceof Error ? error : undefined)
	}
}

server.on('upgrade', (req, socket, head) => {
	upgrade(req as SocketRequest, socket as Socket, head).catch(console.error)
})

export default socket
