import HttpError from '../../error/http'
import ErrorCode from '../../error/code'
import Game from '..'
import Player from '../player'
import GameTurnState from '../client/turn/state'

const onUnmatch = (game: Game, sender: Player, id: string) => {
	const { current } = game

	if (!current)
		throw new HttpError(ErrorCode.Socket, 'The questioner does not exist')

	if (typeof id !== 'string' || id === current.id)
		throw new HttpError(ErrorCode.Socket, 'Invalid player')

	const player = game.players.find(player => player.id === id)

	if (!player) throw new HttpError(ErrorCode.Socket, 'Unknown player')

	const { matches } = game.turn

	if (!matches)
		throw new HttpError(ErrorCode.Socket, 'Unable to load matches')

	if (sender.id !== current.id)
		throw new HttpError(ErrorCode.Socket, 'You must be the one matching')

	if (game.turn.state !== GameTurnState.Matching)
		throw new HttpError(
			ErrorCode.Socket,
			'Matching is not allowed at this time'
		)

	delete matches[player.id]
}

export default onUnmatch
