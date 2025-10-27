import express from 'express'
import type { Router, Request, Response } from 'express'
import { createToken } from '../data/auth.js';
import type { JwtRes, UserPostBody, User } from '../data/types.js';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { db, myTable } from '../data/dynamoDb.js';
import { compare } from 'bcrypt'

const router: Router = express.Router();


router.post('/', async (req: Request<{}, JwtRes | void, UserPostBody>, res: Response<JwtRes | void>) => {
	
	const body: UserPostBody = req.body
	console.log('body', body)

	const command = new QueryCommand({
		TableName: myTable,
		KeyConditionExpression: 'pk = :pk',
		ExpressionAttributeValues: { ':pk': `USER#${body.username}`  
		}
	})
	const output = await db.send(command)
	if( !output.Items || output.Items.length === 0 ) {
		console.log('No items from db')
		res.sendStatus(404)
		return
	}
	const users: User[] = output.Items as User[]
	const found: User | undefined = users.find(user => user.username === body.username)
	if( !found ) {
		console.log('No matching user')
		res.sendStatus(401)
		return
	}
	// vi har hittat en användare - men stämmer lösenordet?
	const passwordMatch: boolean = body.password === found.password
	if (!passwordMatch) {
		console.log('Wrong password', body.password, found.password)
		res.sendStatus(401)
		return
	}

	// pk = 'USER#username'
	console.log('Found user', found)
	const token: string = createToken(found.pk.substring(5)) 
	res.send({ success: true, token: token })
})

export default router