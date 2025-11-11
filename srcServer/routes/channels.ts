//se alla kanaler, gäst + inloggad
//Skapa ny kanal (VG) inloggad
//Ta bort kanal (VG) inloggad
//Öppna kanaler: läsa och skicka meddelanden, för både gäst och inloggad
//Låsta kanaler: läsa och skicka meddelanden, för inloggad användare

import express, { type Request, type Response, type Router } from 'express'
import { ScanCommand, QueryCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { db, myTable } from '../data/dynamoDb.js'
import type { Payload, ChannelBody, JwtRes, ChannelMessagesRes, ChannelParams, ChannelMessage } from '../data/types.js'
import { validateJwt, createToken } from '../data/auth.js';
import { ChannelMessageSchema } from '../data/schemas.js';


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
            isLocked: item.isLocked || false,
            creatorUserId: item.creatorUserId
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
router.get('/:channelId/messages', async (req: Request<ChannelParams>, res: Response<ChannelMessagesRes>) => {
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
                ':pk': `CHANNEL#${channelId}`,
                ':sk': 'MESSAGE#'
            }
        }))
        const messages: ChannelMessage[] = (messageResult.Items || []).map(item => ({
            pk: item.pk,
            sk: item.sk,
            channelId: item.channelId,
            message: item.message,
            senderId: item.senderId,
            time: item.time,
            isLocked: item.isLocked || false
        }));
        res.status(200).send({ 
            success: true,
            messages 
        })
    } catch (error) {
        console.error('Get channel messages error:', error)
        res.status(500).send({ success: false, message: 'Failed to fetch messages' })
    }
})

//  // GET meddelanden för en öppen kanal, även för gäst
// router.get('/:channelId/messages', async (req: Request, res: Response) => {
//     const { channelId } = req.params
//     try {
       
//         // Hämta meddelanden för kanalen med QueryCommand
//         const messageResult = await db.send(new QueryCommand({
//             TableName: myTable,
//             KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
//             ExpressionAttributeValues: {
//                 ':pk': `CHANNEL#${channelId}`,
//                 ':sk': 'MESSAGE#'
//             }
//         }))
//         const messages = messageResult.Items || []
//         res.status(200).send({ messages })
//     } catch (error) {
//         console.error('Error when get messages from the channel:', error)
//         res.status(500).send({ success: false, message: 'Failed to fetch messages' })
//     }
// })

// Skapa ny kanal (endast för inloggad användare)
router.post('/', async (req: Request<{}, JwtRes, ChannelBody>, res: Response<JwtRes>) => {
    const body: ChannelBody = req.body
	console.log('body', body)

    const newChannelId = body.channelId

    // Hämta accessLevel från JWT-payload
    const payload = validateJwt(req.headers['authorization']);
    if (!payload) {
        res.sendStatus(401)
        return
    }

    const command = new PutCommand({
        TableName: myTable,
        Item: {
            //username: {username},
            channelId: newChannelId,
            accessLevel: payload?.accessLevel || 'user',
            isLocked: body.isLocked || false,
            pk: 'CHANNEL#' + newChannelId,
            sk: 'META',
            creatorUserId: payload?.userId 
        }
    })
	try {
		const result = await db.send(command)
		const token: string | null = createToken(payload.userId, payload.username)
		res.send({ success: true, token: token })

	} catch(error) {
		console.log(`register.ts fel:`, (error as any)?.message)
		res.status(500).send({ success: false })
	}

})

// Delete channel, ta bort kanal, bara den som skapat kanalen
router.delete('/:channelId', async (req: Request<ChannelParams>, res: Response<void>) => {
  const channelIdToDelete: string = req.params.channelId;
  const payload: Payload | null = validateJwt(req.headers['authorization']);
  if (!payload) {
    res.sendStatus(401);
    return;
  }

  // Hämta kanalinfo
  const result = await db.send(new ScanCommand({
    TableName: myTable,
    FilterExpression: 'pk = :pk AND sk = :sk',
    ExpressionAttributeValues: {
      ':pk': `CHANNEL#${channelIdToDelete}`,
      ':sk': 'META'
    }
  }));
  const channel = result.Items && result.Items[0];
  if (!channel) {
    res.sendStatus(404);
    return;
  }

  // Tillåt borttagning endast om userId matchar creatorUserId eller om accessLevel är admin
  if (channel.creatorUserId !== payload.userId && payload.accessLevel !== 'admin') {
    res.sendStatus(401);
    return;
  }

  // Ta bort kanalen
  const command = new DeleteCommand({
    TableName: myTable,
    Key: {
      pk: 'CHANNEL#' + channelIdToDelete,
      sk: 'META'
    },
    ReturnValues: "ALL_OLD"
  });
  const output = await db.send(command);
  if (output.Attributes) {
    res.sendStatus(204);
  } else {
    res.sendStatus(404);
  }
});

// POST meddelande till en kanal
router.post('/:channelId/messages', async (req: Request<ChannelParams>, res: Response<ChannelMessagesRes>) => {
    const { channelId } = req.params;
    
    // Validera request body med schema
    const validation = ChannelMessageSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).send({
            success: false,
            message: 'Invalid request data'
        });
    }

    const { message, senderId } = validation.data;

    try {
        // hämta info för kontrollera om kanal är låst
        const channelResult = await db.send(new QueryCommand({
            TableName: myTable,
            KeyConditionExpression: 'pk = :pk AND sk = :sk',
            ExpressionAttributeValues: {
                ':pk': `CHANNEL#${channelId}`,
                ':sk': 'META'
            }
        }));

        const channel = channelResult.Items?.[0];
        if (!channel) {
            return res.status(404).send({ 
                success: false, 
                message: 'Channel not found' 
            });
        }

        // Om kanalen är låst (isLocked = true), kräv JWT-token
        if (channel.isLocked) {
            const payload = validateJwt(req.headers['authorization']);
            if (!payload) {
                return res.status(401).send({ 
                    success: false, 
                    message: 'Authentication required for locked channel' 
                });
            }
        }

        // För öppna kanaler (isLocked = false): tillåt både gäster och inloggade
        // För låsta kanaler (isLocked = true): kräv autentisering (kontrollerat ovan)

        // Skapa meddelande med timestamp
        const timestamp = new Date().toISOString();
        
        const messageItem: ChannelMessage = {
            pk: `CHANNEL#${channelId}`,
            sk: `MESSAGE#${timestamp}`,
            channelId: channelId,
            message: message,
            senderId: senderId,
            time: timestamp,
            isLocked: channel.isLocked || false
        };

        // Spara meddelandet i DynamoDB
        await db.send(new PutCommand({
            TableName: myTable,
            Item: messageItem
        }));

        res.status(201).send({ 
            success: true, 
            message: 'Message sent successfully',
            data: messageItem
        });

    } catch (error) {
        console.error('Error sending channel message:', error);
        res.status(500).send({ 
            success: false, 
            message: 'Failed to send message' 
        });
    }
});

export default router

