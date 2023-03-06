import WebSocket from 'ws'

import PlayerData from './client/player'
import Self from './client/player/self'

export default interface Player {
	socket: WebSocket
	spectating: boolean
	id: string
	name: string
	points: number

	/** Answer to the current question. */
	answer: string | null
}

export const dataFromPlayer = (player: Player): PlayerData => ({
	id: player.id,
	name: player.name,
	points: player.points,
	answered: player.answer !== null
})

export const dataFromSelf = (player: Player): Self => ({
	id: player.id,
	name: player.name,
	points: player.points,
	answer: player.answer
})
