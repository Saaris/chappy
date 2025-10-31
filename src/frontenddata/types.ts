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
	accessLevel: string
}