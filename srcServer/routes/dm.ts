import express, { type Request, type Response, type Router } from 'express';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { db, myTable } from '../data/dynamoDb.js'
import { validateJwt } from '../data/auth.js'
import type { DirectMessage} from '../data/types.js'

const router: Router = express.Router();

// Skicka DM (endast för inloggad användare)
router.post('/', async (req: Request, res: Response) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
	const payload = validateJwt(token);
	if (!payload || (payload.accessLevel !== 'user' && payload.accessLevel !== 'admin')) {
		return res.status(401).send({ success: false, message: 'Access denied: user or admin required' });
	}
//Säkerställer att jag skickar både receiverId och message när man skickar DM.
	const { receiverId, message } = req.body;
	if (!receiverId || !message) {
		return res.status(400).send({ success: false, message: 'receiverId and message required' });
	}

	const dmId = crypto.randomUUID();
	const item: DirectMessage = {
		pk: 'USER#' + receiverId,
		sk: 'DM#' + dmId,
		senderId: payload.username || 'unknown',
		receiverId,
		message,
		sentAt: Date.now()
	};
	const command = new PutCommand({
		TableName: myTable,
		Item: item
	});
	try {
		await db.send(command);
		res.send({ success: true });
	} catch (error) {
		res.status(500).send({ success: false, message: 'Failed to send DM' });
	}
});
//GET meessage (vid specifik receiverId ange det i urlen)
router.get('/:receiverId', async (req, res) => {
	const { receiverId } = req.params;
	const result = await db.send(new QueryCommand({
		TableName: myTable,
		KeyConditionExpression: 'pk = :pk',
		ExpressionAttributeValues: { ':pk': 'USER#' + receiverId }
	}));
	
	const dm = result.Items || []
	res.send({ dm });
});

export default router;