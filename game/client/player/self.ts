import Player from '.'

export default interface Self extends Omit<Player, 'answered'> {
	/** The player's answer to the current question. */
	answer: string | null
}
