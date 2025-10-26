//Skapa ny kanal (VG), bara för inloggad användare
//Ta bort kanal (VG), bara den som skapat kanalen
//Öppna kanaler: läsa och skicka meddelanden, för både gäst och inloggad
//Låsta kanaler: läsa och skicka meddelanden, för inloggad användare
//se alla kanaler, gäst och inloggad användare
import express, { type Request, type Response, type Router } from 'express'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { db, myTable } from '../data/dynamoDb.js'

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
        res.status(200).json({ channels });
        
    } catch (error) {
        console.error('Get channels error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch channels"
        });
    }
})



export default router

