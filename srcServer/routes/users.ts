//se alla användare, för både gäst och inloggad användare
//Registrera ny användare, för både gäst och inloggad användare
//ta bort användare (VG), Man kan bara ta bort sig själv

import express, { type Request, type Response, type Router } from 'express'
import { QueryCommand} from '@aws-sdk/lib-dynamodb'
import type { User, UsersRes, ErrorMessage} from '../data/types.ts'
import { UserSchema } from '../data/schemas.js'

const router: Router = express.Router()

const myTable: string = 'Chappy-data'





export default router