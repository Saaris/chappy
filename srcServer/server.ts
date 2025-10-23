import express from 'express'
import type { Express, Request, Response } from 'express'

const port: number = Number(process.env.PORT) || 1337
const app: Express = express()

app.use(express.static('./dist/'))


//router modules
app.use('/api/users')

app.use('/api/channels')

app.use('/api/dm')

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