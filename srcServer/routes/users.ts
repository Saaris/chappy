//se alla användare, för både gäst och inloggad användare
//Registrera ny användare, för gäst
//ta bort användare (VG), Man kan bara ta bort sig själv

//lägg in hash i POST

import express, { type Request, type Response, type Router } from 'express'
import { PutCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import type { User, UsersRes, ErrorMessage, UserPostRes, Payload} from '../data/types.ts'
import { db, myTable } from '../data/dynamoDb.js'
import { UserSchema } from '../data/schemas.js'
import { genSalt, hash } from 'bcrypt';
import { validateJwt, createToken } from '../data/auth.js';
import { randomUUID } from "crypto";

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
        accessLevel: item.accessLevel ?? 'user',
        userId: item.userId ?? '',
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
    const parseResult = UserSchema.omit({ pk: true, sk: true, accessLevel: true, userId: true }).safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, message: "Ogiltig data" });
  }

    const { username, password } = req.body;
    
    if (!username || !password) {
      const errorResponse: ErrorMessage = {
        success: false,
        message: "Username and password are required"
      };
      return res.status(400).json(errorResponse);
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt); //lägger till ett "salt" till lösenordet innan man hashar. (salt = ett slumpat tal)
    // Spara hashedPassword istället för password
    //newUser objekt, ny användare
    const userId = randomUUID().slice(0, 5);
    const newUser = {
      pk: `USER#${username}`,
      sk: 'NAME',
      username,
      password: hashedPassword,
      accessLevel: 'user',
      userId
    };
      
    await db.send(new PutCommand({
      TableName: myTable,
      Item: newUser,
    }));

    // Skicka tillbaka utan lösenord
    const responseUser: User = {
      pk: 'USER' as const,
      sk: `USER#${username}` as `user#${string}`,
      username: username,
      password: '', 
      accessLevel: 'user',
      userId
    };

    res.status(201).json({ user: responseUser });

  } catch (error) {
    console.error('Create user error:', error); // Här loggas felet i terminalen
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
})

//fylla användarnamn/och elelr lösenord för att kunna ta bort sin användare?
interface UsernameParam {
    username: string
}
router.delete('/:username', async (req: Request<UsernameParam>, res: Response<void>) => {
  const usernameToDelete: string = req.params.username;

  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  const maybePayload: Payload | null = validateJwt(token);
  if (!maybePayload) {
    console.log('Gick inte att validera JWT');
    res.sendStatus(401);
    return;
  }

  const { username } = maybePayload;

  if (username !== usernameToDelete) {
    console.log('Du kan inte ta bort denna användare ', username);
    res.sendStatus(401);
    return;
  }

  const command = new DeleteCommand({
    TableName: myTable,
    Key: {
      pk: `USER#${username}`,
      sk: 'NAME'
    },
    ReturnValues: "ALL_OLD"
  });
  const output = await db.send(command);
  if (output.Attributes) {
    res.sendStatus(204);
  } else {
    res.sendStatus(404);
  }
})

export default router