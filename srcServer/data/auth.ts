import jwt from 'jsonwebtoken'
import type { Payload } from './types.js'


const jwtSecret: string = process.env.MY_JWT_SECRET || ''


function validate(authHeader: string | undefined): Payload | null {
	// 'Bearer token'
	if( !authHeader ) {
		return null
	}
	
	// Kontrollera att det börjar med "Bearer "
	if (!authHeader.startsWith('Bearer ')) {
		console.log('Invalid authorization header format')
		return null
	}
	
	const token: string = authHeader.substring(7) // "Bearer " är 7 tecken
	try {
		const decodedPayload: Payload = jwt.verify(token, jwtSecret) as Payload
		
		const payload: Payload = { username: decodedPayload.username, password: decodedPayload.password, accessLevel: decodedPayload.accessLevel }
		return payload

	} catch(error) {
		console.log('JWT verify failed: ', (error as any)?.message)
		return null
	}
}

function createToken(username: string, password: string, accessLevel: string): string {
	if (!jwtSecret) {
		throw new Error('JWT secret is not configured. Check MY_JWT_SECRET in .env file')
	}
	
	const now = Math.floor(Date.now() / 1000)
	const defaultExpiration: number = now + 15 * 60 
	
	return jwt.sign({
		username: username,
        password: password,
		accessLevel: accessLevel,
		exp: defaultExpiration
	}, jwtSecret)
}

export { createToken, validate, type Payload }