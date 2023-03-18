import { getFirestore, Timestamp } from 'firebase-admin/firestore'

import Game from '.'
import admin from '../lib/firebase'

const firestore = getFirestore(admin)

const saveGame = async (game: Game) => {
	await firestore.doc(`games/${game.code}`).set({
		ended: Timestamp.now(),
		leader: game.leaderName ?? 'unknown',
		players:
			// Players have more than just id, name, points properties
			game.results.players?.map(({ id, name, points }) => ({
				id,
				name,
				points
			})) ?? [],
		questions: game.results.questions
	})
}

export default saveGame
