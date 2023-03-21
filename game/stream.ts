import { io } from '../lib/root'
import HttpError from '../error/http'
import ErrorCode from '../error/code'
import CODE_LENGTH from './client/code'
import Game from '.'
import ClientGameData from './client/data/client'

const namespaceMatch = new RegExp(`^\\/games\\/(.{${CODE_LENGTH}})/stream$`)

io.of(namespaceMatch).on('connection', socket => {
	try {
		const code = socket.nsp.name.match(namespaceMatch)?.[1]

		if (!(code && Game.validCode(code)))
			throw new HttpError(
				ErrorCode.Socket,
				`Game codes must be ${CODE_LENGTH} characters`
			)

		const rawName = socket.handshake.query.name
		const rawNameString =
			typeof rawName === 'string' ? rawName : rawName?.[0]

		const name = rawNameString?.trim() ?? ''

		const game = Game.withCode(code)

		if (!game)
			throw new HttpError(ErrorCode.Socket, 'This game does not exist')

		const player = game.join(socket, name)

		socket.on('message', (message: ClientGameData) => {
			try {
				if (player.spectating)
					throw new HttpError(
						1003,
						'You cannot interact with the game while spectating'
					)

				if (!(message && typeof message.key === 'string'))
					throw new HttpError(ErrorCode.Socket, 'Invalid data')

				game.onMessage(player, message)
			} catch {
				socket.disconnect()
			}
		})

		socket.on('disconnect', () => {
			try {
				game.leave(player)
			} catch (error) {
				console.error(error)
			}
		})
	} catch {
		socket.disconnect()
	}
})
