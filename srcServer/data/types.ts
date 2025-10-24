export interface ErrorMessage {
  success: false;
  message: string;
  issues?: unknown; 
}
export interface UsersRes {
	users: User[];
}

export interface User {
  Pk: 'USER'
  Sk: `user#${string}`
  username: string
  password: string
  accessLevel: 'admin' | 'user'
}
export interface Payload  {
    username: string;
    password: string,
    accessLevel: string;
}
