import GameResultsAnswer from './answer'

export default interface GameResultsQuestion {
	/** Player name. */
	name: string

	question: string
	answers: GameResultsAnswer[]
}
