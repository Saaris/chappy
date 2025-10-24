export interface ErrorMessage {
  error: string;
  issues?: unknown; 
}
export interface UsersRes {
	users: User[];
}

export interface User {
  Pk: 'USER'
  Sk: `NAME#${string}`
  username: string
  password: string
  accessLevel: string
}