import { Router } from 'express'

import HttpError from '../error/http'
import ErrorCode from '../error/code'
import sendError from '../error/send'
import Game from '.'

const router = Router()

router.get('/games/:code/exists', async (req, res) => {
	const { code } = req.params

	try {
		if (!Game.validCode(code))
			throw new HttpError(ErrorCode.BadRequest, 'Invalid game code')

		res.send(await Game.exists(code))
	} catch (error) {
		sendError(res, error)
	}
})

export default router
