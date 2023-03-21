import express from 'express'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { nanoid } from 'nanoid'

import CODE_LENGTH from '../game/client/code'

export const app = express()
export const server = createServer(app)
export const io = new SocketServer(server, { cors: { origin: '*' } })

io.engine.generateId = () => nanoid(CODE_LENGTH)
