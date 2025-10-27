//se alla användare, för både gäst och inloggad användare
//Registrera ny användare, för både gäst och inloggad användare
//ta bort användare (VG), Man kan bara ta bort sig själv

//lägg in hash i POST

import express, { type Request, type Response, type Router } from 'express'
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import type { User, UsersRes, ErrorMessage, UserPostBody, UserPostRes} from '../data/types.ts'
import { db, myTable } from '../data/dynamoDb.js'
import { UserSchema } from '../data/schemas.js'


const router: Router = express.Router()


// //GET alla users
router.get('/', async (req: Request, res: Response<UsersRes | ErrorMessage>) =>  { 
 try {

    const command = new ScanCommand({
      TableName: myTable,
      FilterExpression: 'begins_with(pk, :value)',
      ExpressionAttributeValues: {
        ':value': 'USER#'
      }
    });

    const output = await db.send(command);

    if (!output.Items) {
      res.status(500).send();
      return;
    }

    const users: User[] = (output.Items ?? [])
      .filter(item => item.pk && item.pk.startsWith('USER#'))
      .map(item => ({
        pk: 'USER',
        sk: item.pk,
        username: item.username ?? item.pk.replace('USER#', ''),
        password: item.password ?? '',
        accessLevel: item.accessLevel ?? 'user'
      }));

    res.status(200).send({ users });
  } catch (error) {
    res.status(500).send({ success: false, message: "Failed to fetch user" });
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
      pk: 'USER' as const,
      sk: `USER#${username}` as `user#${string}`,
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