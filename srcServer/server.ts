import express from 'express'
import type { Express, Request, Response } from 'express'

const port: number = Number(process.env.PORT) || 1337
const app: Express = express()

app.use(express.static('./dist/'))