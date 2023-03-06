import HttpError from '../../error/http'
import ErrorCode from '../../error/code'
import Game from '..'
import Player from '../player'
import GameTurnState from '../client/turn/state'

const onDone = (game: Game, player: Player) => {
	const { current } = game

	if (!current)
		throw new HttpError(ErrorCode.Socket, 'The questioner does not exist')

	if (player.id !== current.id)
		throw new HttpError(ErrorCode.Socket, 'You must be the one matching')

	if (game.turn.state !== GameTurnState.Matching)
		throw new HttpError(
			ErrorCode.Socket,
			'Matching is not allowed at this time'
		)

	if (!game.turn.correct)
		throw new HttpError(
			ErrorCode.Socket,
			'You must have seen the correct matches before continuing'
		)

	const range = {
		index: ++game.index,
		players: game.players.length
	}

	if (range.index >= range.players) game.nextRound()
	game.resetTurn()
}

export default onDone
