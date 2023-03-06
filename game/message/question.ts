import HttpError from '../../error/http'
import ErrorCode from '../../error/code'
import GameTurnState from '../client/turn/state'
import MAX_QUESTION_LENGTH from '../client/question'
import Game from '..'
import Player from '../player'

const onQuestion = (game: Game, player: Player, value: string) => {
	if (typeof value !== 'string')
		throw new HttpError(ErrorCode.Socket, 'Invalid question')

	const question = value.trim()

	if (!question)
		throw new HttpError(ErrorCode.Socket, 'Your question cannot be empty')

	if (question.length > MAX_QUESTION_LENGTH)
		throw new HttpError(ErrorCode.Socket, 'Your question is too long')

	const { current } = game

	if (!current)
		throw new HttpError(ErrorCode.Socket, 'The questioner does not exist')

	if (player.id !== current.id)
		throw new HttpError(
			ErrorCode.Socket,
			'You are not allowed to ask a question'
		)

	if (game.turn.state !== GameTurnState.Waiting)
		throw new HttpError(
			ErrorCode.Socket,
			'Asking is not allowed at this time'
		)

	if (game.turn.question !== null)
		throw new HttpError(
			ErrorCode.Socket,
			'A question has already been provided'
		)

	game.turn = {
		state: GameTurnState.Answering,
		question,
		answers: null,
		matches: null,
		correct: null
	}

	game.results.questions.push({ name: player.name, question, answers: [] })
}

export default onQuestion
