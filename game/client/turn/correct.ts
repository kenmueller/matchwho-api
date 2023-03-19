export default interface CorrectGameTurn {
	/** The number of matches the player guessed correctly. */
	count: number

	/** A map of `Player` ids and answer indices, correct state. */
	matches: Record<string, { answer: number; correct: boolean }>
}
