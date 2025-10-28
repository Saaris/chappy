//se alla kanaler, gäst + inloggad
//Skapa ny kanal (VG) inloggad
//Ta bort kanal (VG) inloggad
//Öppna kanaler: läsa och skicka meddelanden, för både gäst och inloggad
//Låsta kanaler: läsa och skicka meddelanden, för inloggad användare

import express, { type Request, type Response, type Router } from 'express'
import { ScanCommand, QueryCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { db, myTable } from '../data/dynamoDb.js'
import type { Payload,ChannelBody, JwtRes} from '../data/types.js'
import { validateJwt, createToken } from '../data/auth.js';


const router: Router = express.Router()

// GET, Se alla kanaler
router.get('/', async (req: Request, res: Response) => {
    try {
        console.log('Fetching all channels from DynamoDB');
        
        const result = await db.send(new ScanCommand({
            TableName: myTable,
            FilterExpression: 'begins_with(pk, :pk) AND sk = :sk',
            ExpressionAttributeValues: {
                ':pk': 'CHANNEL#',
                ':sk': 'META'
            }
        }));

        // Filtrera på kanaler 
        const channels = result.Items?.filter(item => 
            item.pk && item.pk.startsWith('CHANNEL#') && item.sk === 'META'
        ).map(item => ({
            channelId: item.channelId,
            isLocked: item.isLocked || false
        })) || [];

        console.log(`Found ${channels.length} channels:`, channels);
        res.status(200).send({ channels });
        
    } catch (error) {
        console.error('Get channels error:', error);
        res.status(500).send({
            success: false,
            message: "Failed to fetch channels"
        });
    }
})


// GET meddelanden för en kanal
router.get('/:channelId/messages', async (req: Request, res: Response) => {
    const { channelId } = req.params
    try {
        // Hämta kanalinfo för att se om den är låst
        const result = await db.send(new ScanCommand({
            TableName: myTable,
            FilterExpression: 'pk = :pk AND sk = :sk',
            ExpressionAttributeValues: {
                ':pk': `CHANNEL#${channelId}`,
                ':sk': 'META'
            }
        }))
        const channel = result.Items && result.Items[0]
        if (!channel) {
            return res.status(404).send({ success: false, message: 'Channel not found' })
        }
        // Om kanalen är låst, kontrollera JWT-token
       if (channel.isLocked) {
            const payload = validateJwt(req.headers['authorization']);
            if (!payload) {
                return res.status(401).send({ success: false, message: 'Token required or invalid for locked channel' });
            }
            
}
        // Hämta meddelanden för kanalen med QueryCommand
        const messageResult = await db.send(new QueryCommand({
            TableName: myTable,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
            ExpressionAttributeValues: {
                ':pk': 'CHANNEL#grupp1',
                ':sk': 'MESSAGE#'
            }
        }))
        const messages = messageResult.Items || []
        res.status(200).send({ messages })
    } catch (error) {
        console.error('Get channel messages error:', error)
        res.status(500).send({ success: false, message: 'Failed to fetch messages' })
    }
})

 // GET meddelanden för en öppen kanal, även för gäst
router.get('/:channelId/messages', async (req: Request, res: Response) => {
    const { channelId } = req.params
    try {
       
        // Hämta meddelanden för kanalen med QueryCommand
        const messageResult = await db.send(new QueryCommand({
            TableName: myTable,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
            ExpressionAttributeValues: {
                ':pk': `CHANNEL#${channelId}`,
                ':sk': 'MESSAGE#'
            }
        }))
        const messages = messageResult.Items || []
        res.status(200).send({ messages })
    } catch (error) {
        console.error('Error when get messages from the channel:', error)
        res.status(500).send({ success: false, message: 'Failed to fetch messages' })
    }
})


// Skapa ny kanal (endast för inloggad användare)
router.post('/', async (req: Request<{}, JwtRes, ChannelBody>, res: Response<JwtRes>) => {
    const body: ChannelBody = req.body
	console.log('body', body)

    const newChannelId = body.channelId

    // Hämta accessLevel från JWT-payload
    const payload = validateJwt(req.headers['authorization']);
    const command = new PutCommand({
        TableName: myTable,
        Item: {
            channelId: newChannelId,
            accessLevel: payload?.accessLevel || 'user',
            isLocked: body.isLocked || false,
            pk: 'CHANNEL#' + newChannelId,
            sk: 'META'
        }
    })
	try {
		const result = await db.send(command)
		const token: string | null = createToken(newChannelId)
		res.send({ success: true, token: token })

	} catch(error) {
		console.log(`register.ts fel:`, (error as any)?.message)
		res.status(500).send({ success: false })
	}

})


interface ChannelIdParam {
	channelId: string;
}
router.delete('/:channelId', async (req: Request<ChannelIdParam>, res: Response<void>) => {
	const channelIdToDelete: string = req.params.channelId

	const maybePayload: Payload | null = validateJwt(req.headers['authorization'])
	if( !maybePayload ) {
		console.log('Gick inte att validera JWT')
		res.sendStatus(401)
		return
	}

	const {channelId, accessLevel } = maybePayload

	if( channelId !== channelIdToDelete && accessLevel !== 'admin' ) {
		console.log('Inte tillräcklig access level. ', channelId, accessLevel)
		res.sendStatus(401)
		return
	}

	const command = new DeleteCommand({
		TableName: myTable,
		Key: {
			pk: 'CHANNEL',
			sk: `CHANNEL#${channelId}` + channelIdToDelete
		},
		ReturnValues: "ALL_OLD"
	})
	const output = await db.send(command)
	if( output.Attributes ) {
		res.sendStatus(204)  // lyckades ta bort
	} else {
		res.sendStatus(404)
	}
})

export default router

