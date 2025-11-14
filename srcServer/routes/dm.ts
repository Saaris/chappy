import express, { type Request, type Response, type Router } from 'express';
import { PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { db, myTable } from '../data/dynamoDb.js'
import { validateJwt } from '../data/auth.js'
import type { DirectMessage} from '../data/types.js'

const router: Router = express.Router();

// Hämta alla DM
router.get('/', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    const payload = validateJwt(token);
    if (!payload) {
        return res.status(401).send({ success: false, message: 'Access denied' });
    }
    const username = payload.username;
    const userId = payload.userId;

// Hämta DM där användaren är avsändare eller mottagare
// Filtrera BARA på DM-objekt genom att kräva att pk börjar med 'DM#'
    const result = await db.send(new ScanCommand({
        TableName: myTable,
        FilterExpression: 'begins_with(pk, :dmPrefix) AND (senderId = :username OR receiverId = :username OR senderId = :userId OR receiverId = :userId)',
        ExpressionAttributeValues: { 
            ':dmPrefix': 'DM#',
            ':username': username,
            ':userId': userId 
        }
    }));
    const dm = result.Items || [];
    console.log(`Hämtade ${dm.length} DM:s för ${username} (${userId})`);
    res.send({ dm });
});

// Skicka DM (endast för inloggad användare)
router.post('/', async (req: Request, res: Response) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
	const payload = validateJwt(token);
	if (!payload || (payload.accessLevel !== 'user' && payload.accessLevel !== 'admin')) {
		return res.status(401).send({ success: false, message: 'Access denied: user or admin required' });
	}
//Säkerställer att jag skickar både receiverId och message när man skickar DM.
	const { userId, message } = req.body;
	
	if (!userId || !message) {
		return res.status(400).send({ success: false, message: 'userId and message required' });
	}

	const dmId = crypto.randomUUID();
	const item: DirectMessage = {
		pk: 'DM#' + userId,
		sk: 'MESSAGE#' + dmId,
		senderId: payload.username || 'unknown',
		receiverId: userId,
		// userId: payload.username || 'unknown',
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


export default router;