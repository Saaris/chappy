//Skapa ny kanal (VG), bara för inloggad användare
//Ta bort kanal (VG), bara den som skapat kanalen
//Öppna kanaler: läsa och skicka meddelanden, för både gäst och inloggad
//Låsta kanaler: läsa och skicka meddelanden, för inloggad användare
//se alla kanaler, gäst och inloggad användare
import express, { type Request, type Response, type Router } from 'express'
import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, myTable } from '../data/dynamoDb.js'
import jwt from 'jsonwebtoken'

const router: Router = express.Router()

// GET alla kanaler
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

        // Filtrera på kanaler (använd små bokstäver pk/sk)
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
            const authHeader = req.headers['authorization']
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).send({ success: false, message: 'Token required for locked channel' })
            }
            const token = authHeader.substring(7)
            try {
                jwt.verify(token, process.env.MY_JWT_SECRET || '')
            } catch {
                return res.status(401).send({ success: false, message: 'Invalid token' })
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


export default router

