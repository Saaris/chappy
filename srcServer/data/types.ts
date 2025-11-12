export interface ErrorMessage {
  success: false
  message: string
  issues?: unknown
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
  userId: string
}
export interface Payload  {
  channelId: string
  accessLevel: string
  username: string
  creatorUserId: string
  userId: string
}
export interface UserPostBody {
	username: string;
  password: string
}
export interface UserPostRes {
  user: User;
}

export interface JwtRes {
	success: boolean
	token?: string
	username?: string
	userId?: string
}
export interface ChannelBody {
  username: string
  channelId: string
  accessLevel: string
  password: string
  isLocked: string
}
export interface DirectMessage {
  pk: string
  sk: string
  senderId: string
  receiverId: string
  message: string
  sentAt: number
  // userId: string
}
export interface ChannelMessage {
  pk: string
  sk: string
  channelId: string
  message: string
  senderId: string
  time: string
  isLocked: boolean
}

// interface för channel routes
export interface ChannelParams {
  channelId: string
}

// interface för channel messages
export interface ChannelMessagesRes {
  success: boolean
  message?: string
  messages?: ChannelMessage[]
  data?: ChannelMessage
}

