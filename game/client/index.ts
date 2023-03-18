import GameState from './state'
import GameTurn from './turn'
import GameResults from './results'
import Player from './player'
import Self from './player/self'

export default interface Game {
	code: string

	leaderName: string

	state: GameState
	round: number

	/** `null` if the game hasn't started yet. */
	turn: GameTurn | null

	/** `null` if the game isn't completed yet. */
	results: GameResults | null

	/**
	 * The player this data is being sent to.
	 * `null` if the player is spectating the game.
	 */
	self: Self | null

	/** The leader of the game. */
	leader: Player | null

	players: Player[]
}
