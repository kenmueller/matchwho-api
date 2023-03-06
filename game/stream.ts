import socket from '../socket'
import HttpError from '../error/http'
import ErrorCode from '../error/code'
import keepAlive from '../socket/alive'
import closeWithError from '../error/close'
import CODE_LENGTH from './client/code'
import Game from '.'
import ClientGameData from './client/data/client'

socket('/games/:code', (socket, req) => {
	const { code } = req.params

	try {
		const name = req.query.get('name')?.trim() ?? ''

		if (!Game.validCode(code))
			throw new HttpError(
				ErrorCode.Socket,
				`Game codes must be ${CODE_LENGTH} characters`
			)

		const game = Game.withCode(code)

		if (!game)
			throw new HttpError(ErrorCode.Socket, 'This game does not exist')

		const player = game.join(socket, name)

		keepAlive(socket)

		socket.on('message', (data, isBinary) => {
			try {
				if (player.spectating)
					throw new HttpError(
						1003,
						'You cannot interact with the game while spectating'
					)

				const message = JSON.parse(
					data.toString(isBinary ? 'binary' : 'utf8')
				) as ClientGameData | null

				if (!(message && typeof message.key === 'string'))
					throw new HttpError(ErrorCode.Socket, 'Invalid data')

				game.onMessage(player, message)
			} catch (error) {
				closeWithError(socket, error)
			}
		})

		socket.on('close', () => {
			try {
				game.leave(player)
			} catch (error) {
				console.error(error)
			}
		})
	} catch (error) {
		closeWithError(socket, error)
	}
})
