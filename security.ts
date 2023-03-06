import { Router } from 'express'

import sendError from './error/send'

const router = Router()

router.use((_req, res, next) => {
	try {
		res.header('access-control-allow-origin', '*')
		next()
	} catch (error) {
		sendError(res, error)
	}
})

export default router
