import jwt from 'jsonwebtoken'
import type { Payload } from './types.js'

const myJwtSecret: string = process.env.MY_JWT_SECRET || ''

function createToken(userId: string,username: string, accessLevel?: string): string {
	if (!myJwtSecret) {
		throw new Error('JWT secret is not configured. Check MY_JWT_SECRET in .env file')
	}
	
	const now = Math.floor(Date.now() / 1000)

	const expiration: number = now + 60 * 60
	
	return jwt.sign({
		userId: userId,
		username: username,
		accessLevel: accessLevel || 'user',
		exp: expiration
	}, myJwtSecret)
}

function validateJwt(authHeader: string | undefined): Payload | null {
	
	if( !authHeader ) {
		return null
	}
	
	const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

	try {
		const decodedPayload: Payload = jwt.verify(token, myJwtSecret) as Payload;
		const userPayload: Payload = { 
			channelId: decodedPayload.channelId, 
			accessLevel: decodedPayload.accessLevel, 
			username: decodedPayload.username,
			userId: decodedPayload.userId, 
			creatorUserId: decodedPayload.creatorUserId 
		};
	
		return userPayload;
	} catch (error) {
		return null;
	}
}
export { createToken, validateJwt }