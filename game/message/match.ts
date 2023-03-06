import HttpError from '../../error/http'
import ErrorCode from '../../error/code'
import Game from '..'
import Player from '../player'
import GameTurnState from '../client/turn/state'
import MatchData from '../client/data/match'

const onMatch = (game: Game, sender: Player, value: MatchData) => {
	if (!(typeof value === 'object' && value))
		throw new HttpError(ErrorCode.Socket, 'Invalid match')

	const { current } = game

	if (!current)
		throw new HttpError(ErrorCode.Socket, 'The questioner does not exist')

	const { player: id, answer } = value

	if (typeof id !== 'string' || id === current.id)
		throw new HttpError(ErrorCode.Socket, 'Invalid player')

	const player = game.players.find(player => player.id === id)

	if (!player) throw new HttpError(ErrorCode.Socket, 'Unknown player')

	const { answers, matches } = game.turn

	if (!answers)
		throw new HttpError(ErrorCode.Socket, 'Unable to load answers')

	if (!matches)
		throw new HttpError(ErrorCode.Socket, 'Unable to load matches')

	if (typeof answer !== 'number' || answer < 0 || answer >= answers.length)
		throw new HttpError(ErrorCode.Socket, 'Invalid answer')

	if (sender.id !== current.id)
		throw new HttpError(ErrorCode.Socket, 'You must be the one matching')

	if (game.turn.state !== GameTurnState.Matching)
		throw new HttpError(
			ErrorCode.Socket,
			'Matching is not allowed at this time'
		)

	for (const [otherPlayer, otherAnswer] of Object.entries(matches))
		if (otherAnswer === answer) {
			delete matches[otherPlayer]
			break
		}

	matches[player.id] = answer
}

export default onMatch
