import GameTurnState from './state'
import Player from '../player'
import CorrectGameTurn from './correct'

export default interface GameTurn {
	player: Player
	state: GameTurnState

	/**
	 * The current question.
	 * `null` if the current player hasn't thought of a question yet.
	 */
	question: string | null

	/**
	 * All the player's answers to the current question.
	 * Does not provide a reference back to who gave the answer.
	 * Shuffled.
	 */
	answers: string[] | null

	/** A map of player ids and answer indices. */
	matches: Record<string, number> | null

	/**
	 * The correct state of the game.
	 * `null` when the player has not finished matching.
	 */
	correct: CorrectGameTurn | null
}
