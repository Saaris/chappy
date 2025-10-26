import express from 'express'
import type { Router, Request, Response } from 'express'
import { createToken } from '../data/auth.js';
import type { JwtRes, UserPostBody, User } from '../data/types.js';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { db, myTable } from '../data/dynamoDb.js';
import { compare } from 'bcrypt'

const router: Router = express.Router();



router.post('/', async (req: Request<{}, JwtRes | void, UserPostBody>, res: Response<JwtRes | void>) => {
	// validera body
	// finns användaren i databasen? QueryCommand
	// matchar lösenordet?
	// om ja, skapa JWT och skicka tillbaka
	// om nej, svara med status 401

	// TODO: använd Zod för att kontrollera body
	const body: UserPostBody = req.body
	console.log('body', body)

	const command = new QueryCommand({
		TableName: myTable,
		KeyConditionExpression: 'pk = :value',
		ExpressionAttributeValues: {
			':value': `USER#${body.username}` // ✅ Sök efter specifik användare
		}
	})
	const output = await db.send(command)
	if( !output.Items || output.Items.length === 0 ) {
		console.log('No items from db')
		res.sendStatus(404)
		return
	}

	// ✅ Ta första (och enda) användaren direkt
	const found = output.Items[0]
	if( !found ) {
		console.log('No matching user')
		res.sendStatus(401)
		return
	}
	// vi har hittat en användare - men stämmer lösenordet?
	const passwordMatch: boolean = body.password === found.password
	if( !passwordMatch ) {
		console.log('Wrong password', body.password, found.password)
		res.sendStatus(401)
		return
	}

	// pk = 'USER#username'
	console.log('Found user', found)
	const token: string = createToken(found.pk.substring(5)) // ✅ Använd pk istället för Sk
	res.send({ success: true, token: token })
})

export default router