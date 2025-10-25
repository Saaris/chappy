//se alla användare, för både gäst och inloggad användare
//Registrera ny användare, för både gäst och inloggad användare
//ta bort användare (VG), Man kan bara ta bort sig själv

import express, { type Request, type Response, type Router } from 'express'
import { PutCommand, ScanCommand} from '@aws-sdk/lib-dynamodb'
import type { User, UsersRes, ErrorMessage, UserPostBody, UserPostRes} from '../data/types.ts'
import { db, myTable } from '../data/dynamoDb.js'
import { UserSchema } from '../data/schemas.js'

const router: Router = express.Router()


router.get('/', async (req: Request, res: Response<UsersRes | ErrorMessage>) =>  { 
  try {
    console.log('Trying to scan DynamoDB table:', myTable);
    
    const result = await db.send(new ScanCommand({
      TableName: myTable
    }));

    console.log('DynamoDB scan result:', {
      Count: result.Count,
      Items: result.Items
    });

    const users: User[] = [];
    
    if (result.Items && result.Items.length > 0) {
      console.log('Processing', result.Items.length, 'items from DynamoDB');
      
      for (const item of result.Items) {
        console.log('Processing item:', JSON.stringify(item, null, 2));
        
        if (item.pk && item.pk.startsWith('USER#')) {
          try {
            const username = item.pk.replace('USER#', '');
            users.push({
              Pk: 'USER',
              Sk: item.pk, // USER#sara
              username: item.username || username,
              password: item.password || '',
              accessLevel: item.accessLevel || 'user'
            });
            console.log('Added user:', username);
          } catch (error) {
            console.warn('Error processing user:', error);
          }
        }
      }
    } else {
      console.log('No items found in DynamoDB');
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

// registrera ny användare


router.post('/', async (req: Request, res: Response<UserPostRes | ErrorMessage>) => {
  try {
    // Validera inkommande data
    const { username, password } = req.body;
    
    if (!username || !password) {
      const errorResponse: ErrorMessage = {
        success: false,
        message: "Username and password are required"
      };
      return res.status(400).json(errorResponse);
    }
  
    const newUser = {
      pk: `USER#${username}`,
      sk: 'NAME', 
      username,
      password,
      accessLevel: 'user'
    };

    await db.send(new PutCommand({
      TableName: myTable,
      Item: newUser,
    }));

    // Skicka tillbaka utan lösenord i rätt format för API
    const responseUser: User = {
      Pk: 'USER' as const,
      Sk: `USER#${username}` as `user#${string}`,
      username: username,
      password: '', // Dölj lösenordet
      accessLevel: 'user'
    };

    res.status(201).json({ user: responseUser });

  } catch (error) {
    console.error('Create user error:', error);
    const errorResponse: ErrorMessage = {
      success: false, 
      message: "Failed to create user"
    };
    res.status(500).json(errorResponse);
  }
})


export default router