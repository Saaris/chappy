import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// skapar en anslutning till DynamoDB databas
const accessKey: string = process.env.ACCESS_KEY || ''
const secret: string = process.env.SECRET_ACCESS_KEY || ''

const client: DynamoDBClient = new DynamoDBClient({
	region: "eu-north-1", 
	credentials: {
		accessKeyId: accessKey,
		secretAccessKey: secret,
	},
});
//Skapar Document Client 
const db: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client);

const myTable = 'chappy-data'

export { db, myTable }