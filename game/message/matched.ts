import HttpError from '../../error/http'
import ErrorCode from '../../error/code'
import Game from '..'
import Player from '../player'
import GameTurnState from '../client/turn/state'

const onMatched = (game: Game, player: Player) => {
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

	const { answers, matches } = game.turn

	if (!answers)
		throw new HttpError(ErrorCode.Socket, 'Unable to load answers')

	if (!matches)
		throw new HttpError(ErrorCode.Socket, 'Unable to load matches')

	if (!game.matched)
		throw new HttpError(
			ErrorCode.Socket,
			'Not all answers have been matched.'
		)

	const { notCurrent } = game

	if (!notCurrent)
		throw new HttpError(ErrorCode.Socket, 'The questioner does not exist')

	/** The index after the last index of the answer. */
	const nextAnswer: Record<string, number> = {}

	game.turn.correct = {
		count: notCurrent.reduce(
			(count, { id, answer }) =>
				count + (answers[matches[id]] === answer ? 1 : 0),
			0
		),
		matches: notCurrent.reduce<Record<string, number>>(
			(matches, { id, answer }) => {
				if (!answer) return matches

				const index = answers.indexOf(answer, nextAnswer[answer])
				if (index < 0) return matches

				matches[id] = index
				nextAnswer[answer] = index + 1

				return matches
			},
			{}
		)
	}

	player.points += Object.entries(matches).reduce((points, [id, index]) => {
		const player = game.players.find(player => player.id === id)
		return points + (player?.answer === answers[index] ? 1 : 0)
	}, 0)
}

export default onMatched
