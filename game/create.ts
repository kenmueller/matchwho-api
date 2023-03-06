import { Router } from 'express'

import rateLimit from '../rate'
import sendError from '../error/send'
import Game from '.'

const router = Router()

router.post('/games', rateLimit(5, 15), (_req, res) => {
	try {
		res.send(new Game().code)
	} catch (error) {
		sendError(res, error)
	}
})

export default router
