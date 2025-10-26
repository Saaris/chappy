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
export interface UserPostBody {
	username: string;
  password: string
}
export interface UserPostRes {
  user: User;
}

export interface JwtRes {
	success: boolean;
	token?: string;  
}
