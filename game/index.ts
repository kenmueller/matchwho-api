import WebSocket from 'ws'
import { nanoid } from 'nanoid'
import shuffle from 'shuffle-array'

import CODE_LENGTH from './client/code'
import ID_LENGTH from './client/id'
import ROUNDS from './client/rounds'
import TOP_PLAYERS from './client/player/top'
import { MIN_PLAYERS, MAX_PLAYERS } from './client/player/bounds'
import MAX_NAME_LENGTH from './client/name'
import HttpError from '../error/http'
import ErrorCode from '../error/code'
import Player, { dataFromPlayer, dataFromSelf } from './player'
import ServerGameData from './client/data/server'
import ClientGameData from './client/data/client'
import GameState from './client/state'
import GameTurnState from './client/turn/state'
import GameMeta from './client/meta'
import GameTurn from './client/turn'
import InternalGameTurn from './turn'
import GameResults from './client/results'
import onStart from './message/start'
import onQuestion from './message/question'
import onAnswer from './message/answer'
import onMatch from './message/match'
import onUnmatch from './message/unmatch'
import onMatched from './message/matched'
import onDone from './message/done'
import onNext from './message/next'

export default class Game {
	static games: Record<string, Game> = {}

	code = nanoid(CODE_LENGTH).toLowerCase()

	players: Player[] = []
	spectators: Player[] = []

	state = GameState.Joining

	round = 1
	index = 0

	turn: InternalGameTurn = {
		state: GameTurnState.Waiting,
		question: null,
		answers: null,
		matches: null,
		correct: null
	}

	results: GameResults = {
		next: null,
		players: null,
		questions: []
	}

	constructor() {
		Game.games[this.code] = this
	}

	static validCode = (code: string) => code.length === CODE_LENGTH

	static exists = (code: string) =>
		Object.prototype.hasOwnProperty.call(Game.games, code)

	static withCode = (code: string) =>
		Game.exists(code) ? Game.games[code] : null

	get meta(): GameMeta {
		return {
			state: this.state,
			leader: this.leader?.name ?? null,
			next: this.results.next
		}
	}

	get leader() {
		return this.players[0] ?? null
	}

	get current() {
		return this.players[this.index] ?? null
	}

	get question() {
		return this.results.questions[this.results.questions.length - 1] ?? null
	}

	get notCurrent() {
		const { current } = this
		return current && this.players.filter(({ id }) => id !== current.id)
	}

	get answers() {
		const players = this.notCurrent?.map(({ answer }) => answer)
		return players?.every(Boolean) ? shuffle(players as string[]) : null
	}

	/** If all answers are matched. */
	get matched() {
		const players = this.notCurrent
		const { matches } = this.turn

		return (
			!(players === null || matches === null) &&
			players.length <= Object.keys(matches).length
		)
	}

	/** Includes only the top players. */
	get topResults(): GameResults {
		return {
			...this.results,
			players: this.results.players?.slice(0, TOP_PLAYERS) ?? null
		}
	}

	listOf = (player: Player) =>
		this[player.spectating ? 'spectators' : 'players']

	join = (socket: WebSocket, name: string) => {
		if (name.length > MAX_NAME_LENGTH)
			throw new HttpError(ErrorCode.Socket, 'Your name is too long')

		const player: Player = {
			socket,
			spectating: !(
				this.players.length < MAX_PLAYERS &&
				this.state === GameState.Joining &&
				name
			),
			id: nanoid(ID_LENGTH),
			name,
			points: 0,
			answer: null
		}

		this.listOf(player).push(player)
		player.spectating ? this.sendGame(player) : this.sendGame()

		return player
	}

	leave = (player: Player) => {
		const list = this.listOf(player)

		const index = list.indexOf(player)
		if (index < 0) return

		list.splice(index, 1)

		switch (this.state) {
			case GameState.Started:
				if (player.spectating) return

				if (this.players.length < MIN_PLAYERS) {
					this.complete()
				} else {
					if (index < this.index) this.index--
					if (index === this.index) this.resetTurn()

					if (this.index >= this.players.length) {
						this.nextRound()
						this.resetTurn()
					}
				}

				break
			// Don't delete game after the last player has left in order to redirect players who joined the old game code to the new game
			// case GameState.Completed:
			// 	if (this.players.length || this.spectators.length) break
			//
			// 	delete Game.games[this.code]
			// 	return
		}

		this.sendGame()
	}

	nextRound = () => {
		if (this.round === ROUNDS) {
			this.complete()
		} else {
			this.round++
			this.index = 0
		}
	}

	resetTurn = () => {
		for (const player of this.players) player.answer = null

		this.turn = {
			state: GameTurnState.Waiting,
			question: null,
			answers: null,
			matches: null,
			correct: null
		}
	}

	complete = () => {
		this.state = GameState.Completed

		this.results.players = [...this.players]
			.sort((a, b) => b.points - a.points)
			.map(dataFromPlayer)
	}

	onMessage = (player: Player, message: ClientGameData) => {
		switch (message.key) {
			case 'start':
				onStart(this, player)
				break
			case 'question':
				onQuestion(this, player, message.value)
				break
			case 'answer':
				onAnswer(this, player, message.value)
				break
			case 'match':
				onMatch(this, player, message.value)
				break
			case 'unmatch':
				onUnmatch(this, player, message.value)
				break
			case 'matched':
				onMatched(this, player)
				break
			case 'done':
				onDone(this, player)
				break
			case 'next':
				onNext(this, player)
				break
			default:
				throw new HttpError(
					ErrorCode.Socket,
					`Invalid message ${JSON.stringify(message)}`
				)
		}

		this.sendGame()
	}

	sendGame = (...destinations: Player[]) => {
		const { code, state, round, leader: gameLeader, current } = this

		const turn: GameTurn = current && {
			...this.turn,
			player: dataFromPlayer(current)
		}

		const results =
			this.state === GameState.Completed ? this.topResults : null

		const leader = gameLeader && dataFromPlayer(gameLeader)
		const players = this.players.map(dataFromPlayer)

		destinations = destinations.length
			? destinations
			: [...this.players, ...this.spectators]

		for (const player of destinations) {
			const data: ServerGameData = {
				key: 'game',
				value: {
					code,
					state,
					round,
					turn,
					results,
					self: player.spectating ? null : dataFromSelf(player),
					leader,
					players
				}
			}

			player.socket.send(JSON.stringify(data))
		}
	}
}
