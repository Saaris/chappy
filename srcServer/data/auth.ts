import jwt from 'jsonwebtoken'
import type { Payload } from './types.js'

const myJwtSecret: string = process.env.MY_JWT_SECRET || ''

function createToken(username: string, accessLevel?: string): string {
	if (!myJwtSecret) {
		throw new Error('JWT secret is not configured. Check MY_JWT_SECRET in .env file')
	}
	
	const now = Math.floor(Date.now() / 1000)

	const defaultExpiration: number = now + 15 * 60
	
	console.log('JWT sign secret:', myJwtSecret); // i createToken
	
	return jwt.sign({
		username: username,
		accessLevel: accessLevel || 'user',
		exp: defaultExpiration
	}, myJwtSecret)
}

function validateJwt(authHeader: string | undefined): Payload | null {
	
	if( !authHeader ) {
		return null
	}
	
	const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
	console.log('Token to verify:', token);
	try {
		const decodedPayload: Payload = jwt.verify(token, myJwtSecret) as Payload;
		const userPayload: Payload = { 
			channelId: decodedPayload.channelId, 
			accessLevel: decodedPayload.accessLevel, 
			username: decodedPayload.username };
		console.log('JWT verify secret:', myJwtSecret); // i validateJwt
		return userPayload;
	} catch (error) {
		console.log('JWT verify failed: ', (error as any)?.message);
		return null;
	}
}
export { createToken, validateJwt }