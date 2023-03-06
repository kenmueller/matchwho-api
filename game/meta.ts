import { Router } from 'express'

import HttpError from '../error/http'
import ErrorCode from '../error/code'
import sendError from '../error/send'
import Game from '.'

const router = Router()

router.get('/games/:code', async (req, res) => {
	const { code } = req.params

	try {
		if (!Game.validCode(code))
			throw new HttpError(ErrorCode.BadRequest, 'Invalid game code')

		const game = Game.withCode(code)

		if (!game)
			throw new HttpError(ErrorCode.NotFound, 'This game does not exist')

		res.send(game.meta)
	} catch (error) {
		sendError(res, error)
	}
})

export default router
