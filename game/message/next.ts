import HttpError from '../../error/http'
import ErrorCode from '../../error/code'
import GameState from '../client/state'
import Game from '..'
import Player from '../player'

const onNext = (game: Game, player: Player) => {
	if (game.state !== GameState.Completed)
		throw new HttpError(ErrorCode.Socket, 'The game has not been completed')

	if (game.results.next !== null)
		throw new HttpError(ErrorCode.Socket, 'There is already a next game')

	if (player.id !== game.leader?.id)
		throw new HttpError(
			ErrorCode.Socket,
			'You must be the leader to create the next game'
		)

	game.results.next = new Game().code
}

export default onNext
