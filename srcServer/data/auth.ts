import jwt from 'jsonwebtoken'
import type { Payload } from './types.js'

const jwtSecret: string = process.env.MY_JWT_SECRET || ''

function createToken(username: string, accessLevel?: string): string {
	if (!jwtSecret) {
		throw new Error('JWT secret is not configured. Check MY_JWT_SECRET in .env file')
	}
	
	const now = Math.floor(Date.now() / 1000)

	const defaultExpiration: number = now + 15 * 60
	
	return jwt.sign({
		username: username,
		accessLevel: accessLevel || 'user',
		exp: defaultExpiration
	}, jwtSecret)
}

function validateJwt(authHeader: string | undefined): Payload | null {
	
	if( !authHeader ) {
		return null
	}
	
	const token: string = authHeader.substring(8)  // alternativ: slice, split
	try {
		const decodedPayload: Payload = jwt.verify(token, process.env.JWT_SECRET || '') as Payload
		// TODO: validera decodedPayload
		const payload: Payload = {channelId: decodedPayload.channelId, accessLevel: decodedPayload.accessLevel }
		return payload

	} catch(error) {
		console.log('JWT verify failed: ', (error as any)?.message)
		return null
	}
}
export { createToken, validateJwt }