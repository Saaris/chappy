import express from 'express'
import type { Express, Request, Response } from 'express'
import usersRouter from './routes/users.js'
import dmRouter from './routes/dm.js'
import channelsRouter from './routes/channels.js'
import loginRouter from './routes/login.js'
import { logger } from './middleware.js'
import cors from 'cors'


const port: number = Number(process.env.PORT) || 1337
const app: Express = express()

app.use(express.static('./dist/'))
app.use(express.json()) // För att läsa JSON från POST-requests
app.use('/', logger)
app.use(cors())


//router modules
app.use('/api/users', usersRouter)

app.use('/api/channels', channelsRouter)

app.use('/api/dm', dmRouter)

app.use('/api/login', loginRouter)

//check that the server is started
app.get('/api/ping', (req: Request, res: Response) => {
	
	res.send({ message: 'Pong' })
})


app.listen(port, (error) => {
	if( error ) {
		console.log('Server could not start! ', error.message)
	} else {
		console.log(`Server is listening on port ${port}...`)
	}
})