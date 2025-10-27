import * as z from "zod"

export const UserSchema = z.object ({
	pk: z.literal('USER'),    
	sk: z.string().regex(/^user#\d+$/).transform(val => val as `user#${string}`), 
	username: z.string().min(1).max(50),
    password: z.string().min(2).max(50),
    accessLevel: z.enum(['admin', 'user'])
})
