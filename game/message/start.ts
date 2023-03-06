import HttpError from '../../error/http'
import ErrorCode from '../../error/code'
import GameState from '../client/state'
import { MIN_PLAYERS } from '../client/player/bounds'
import Game from '..'
import Player from '../player'

const onStart = (game: Game, player: Player) => {
	if (game.players.length < MIN_PLAYERS)
		throw new HttpError(
			ErrorCode.Socket,
			'The game does not have enough players'
		)

	if (game.state !== GameState.Joining)
		throw new HttpError(ErrorCode.Socket, 'The game has already started')

	if (player.id !== game.leader?.id)
		throw new HttpError(
			ErrorCode.Socket,
			'You must be the leader to start the game'
		)

	game.state = GameState.Started
}

export default onStart
