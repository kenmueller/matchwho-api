if (!process.env.FIREBASE_ADMIN_KEY)
	throw new Error('Missing FIREBASE_ADMIN_KEY')

if (!process.env.FIREBASE_STORAGE_BUCKET)
	throw new Error('Missing FIREBASE_STORAGE_BUCKET')

import { app, server } from './lib/root'
import PORT from './lib/port'
import security from './lib/security'
import createGame from './game/create'
import gameExists from './game/exists'
import gameMeta from './game/meta'
import './game/stream'

app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(security)
app.use(createGame)
app.use(gameExists)
app.use(gameMeta)

server.listen(PORT, () => {
	console.log(`Listening on http://localhost:${PORT}`)
})
