import express from 'express'

const app = express()

app.get('/', (_req, res) => {
	res.send('Match Who')
})

app.listen(process.env.PORT || '3000')
