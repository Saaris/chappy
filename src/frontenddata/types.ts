export interface User {
	username: string
	password: string
	accessLevel: string
	userId: string
}
export interface UserResp {
	username: string
	userId: string
}
export interface UserLogin {
	username: string
	password: string
}
export interface UserRegister {
	username: string
	password: string
	accessLevel: 'user'
	confirmPassword: string;  
}
export interface DmResponse {
	senderId: string
	receiverId: string
	message: string
	sentAt: string
}
export interface Channel {
	channelId: string,
	isLocked: boolean
	creatorUserId: string
}
