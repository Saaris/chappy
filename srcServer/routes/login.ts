import express from 'express'
import type { Router, Request, Response } from 'express'
import { createToken } from '../data/auth.js';
import type { JwtRes, UserPostBody, User } from '../data/types.js';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { db, myTable } from '../data/dynamoDb.js';
import { compare } from 'bcrypt';
import { UserSchema } from '../data/schemas.js';

const router: Router = express.Router();

// logga in användare
router.post('/', async (req: Request<{}, JwtRes | void, UserPostBody>, res: Response<JwtRes | void>) => {
	
	const result = UserSchema.pick({ username: true, password: true }).safeParse(req.body);
	if (!result.success) {
		res.sendStatus(400)
		return
	}

	const body: UserPostBody = result.data

	const command = new QueryCommand({
		TableName: myTable,
		KeyConditionExpression: 'pk = :pk',
		ExpressionAttributeValues: { ':pk': `USER#${body.username}`  
		}
	})
	const output = await db.send(command)
	if( !output.Items || output.Items.length === 0 ) {
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
	//  se ifall lösen stämmer
	const loginSuccess = await compare(body.password, found.password);
	if (!loginSuccess) {
		console.log('Wrong password', body.password, found.password)
		res.sendStatus(401)
		return
	}

	// pk = 'USER#username'
	const token: string = createToken(found.userId, found.pk.substring(5), found.accessLevel)
	res.send({ 
		success: true, 
		token: token,
		username: found.username,
		userId: found.userId 
	})
})

export default router