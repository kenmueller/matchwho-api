import Player from '../player'
import GameResultsQuestion from './question'

export default interface GameResults {
	/** Next game code. */
	next: string | null

	/** Top players. */
	players: Player[] | null

	questions: GameResultsQuestion[]
}
