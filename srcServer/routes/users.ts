//se alla användare, för både gäst och inloggad användare
//Registrera ny användare, för både gäst och inloggad användare
//ta bort användare (VG), Man kan bara ta bort sig själv

import express, { type Request, type Response, type Router } from 'express'
import { ScanCommand} from '@aws-sdk/lib-dynamodb'
import type { User, UsersRes, ErrorMessage} from '../data/types.ts'
import { UserSchema } from '../data/schemas.js'
import { db, myTable } from '../data/dynamoDb.js'

const router: Router = express.Router()


router.get('/', async (req: Request, res: Response<UsersRes | ErrorMessage>) =>  { 
  try {
    const result = await db.send(new ScanCommand({
      TableName: myTable,
      FilterExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': 'USER'
      }
    }));

    const users: User[] = [];
    
    if (result.Items) {
      for (const item of result.Items) {
        try {
          // Validera och transformera data med UserSchema
          const validatedUser = UserSchema.parse({
            Pk: item.pk,
            Sk: item.sk,
            username: item.username,
            password: item.password || '',
            accessLevel: item.accessLevel || 'user'
          });
          
          users.push({
            Pk: validatedUser.Pk,
            Sk: validatedUser.Sk,
            username: validatedUser.username,
            password: validatedUser.password,
            accessLevel: validatedUser.accessLevel
          });
        } catch (validationError) {
          console.warn('Skipping invalid user data:', validationError);
          // Hoppa över ogiltiga användare istället för att krascha
        }
      }
    }

    res.status(200).json({ users }); 
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch users" 
    }); 
  }
});






export default router