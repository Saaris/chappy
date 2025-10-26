import jwt from 'jsonwebtoken'

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

export { createToken }