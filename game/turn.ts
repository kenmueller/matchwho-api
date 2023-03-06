import GameTurn from './client/turn'
import GameTurnState from './client/turn/state'

type SharedKeys = 'question' | 'answers' | 'matches' | 'correct'

export default interface InternalGameTurn extends Pick<GameTurn, SharedKeys> {
	state: GameTurnState
}
