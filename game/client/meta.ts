import GameState from './state'

export const GAME_META_HEADER = 'x-game-meta'

export default interface GameMeta {
	state: GameState

	/** The leader of the game. */
	leader: string | null

	/** The next game code. */
	next: string | null
}
