import HttpError from '../../error/http'
import ErrorCode from '../../error/code'
import GameTurnState from '../client/turn/state'
import MAX_ANSWER_LENGTH from '../client/answer'
import Game from '..'
import Player from '../player'

const onAnswer = (game: Game, player: Player, value: string) => {
	if (typeof value !== 'string')
		throw new HttpError(ErrorCode.Socket, 'Invalid answer')

	const answer = value.trim()

	if (!answer)
		throw new HttpError(ErrorCode.Socket, 'Your answer cannot be empty')

	if (answer.length > MAX_ANSWER_LENGTH)
		throw new HttpError(ErrorCode.Socket, 'Your answer is too long')

	const { current } = game

	if (!current)
		throw new HttpError(ErrorCode.Socket, 'The questioner does not exist')

	if (player.id === current.id)
		throw new HttpError(
			ErrorCode.Socket,
			'You cannot answer your own question'
		)

	if (game.turn.state !== GameTurnState.Answering)
		throw new HttpError(
			ErrorCode.Socket,
			'Answering is not allowed at this time'
		)

	if (player.answer !== null)
		throw new HttpError(
			ErrorCode.Socket,
			'An answer has already been provided'
		)

	player.answer = answer
	const { answers, question } = game

	if (answers)
		game.turn = {
			...game.turn,
			state: GameTurnState.Matching,
			answers,
			matches: {}
		}

	if (!question) return

	question.answers.push({
		name: player.name,
		answer: player.answer
	})
}

export default onAnswer
