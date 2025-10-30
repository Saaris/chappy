import * as z from "zod"

export const UserSchema = z.object ({
	pk: z.literal('USER'),    
	sk: z.string().regex(/^user#\d+$/).transform(val => val as `user#${string}`), 
	username: z.string().min(1).max(30),
    password: z.string().min(2).max(30),
    accessLevel: z.enum(['admin', 'user']),
	userId: z.string().uuid(),
})
const result = UserSchema.safeParse({
  pk: "USER",
  sk: "user#123",
  username: "testuser",
  password: "lösenord123",
  userId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  accessLevel: "user",
});
if (!result.success) {
  console.log(result.error);
} else {
  console.log("Validering lyckades!", result.data); //ta bort hela if satsen sen
}