export interface ErrorMessage {
  success: false;
  message: string;
  issues?: unknown; 
}
export interface UsersRes {
	users: User[];
}

export interface User {
  pk: 'USER'
  sk: `user#${string}`
  username: string
  password: string
  accessLevel: 'admin' | 'user'
}
export interface Payload  {
    channelId: string,
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
export interface ChannelBody {
  channelId: string,
  accessLevel: string
  password: string
  isLocked: string
}
