export type User = {
  lastActive?: string
  id: string
  username: string
}

export type Message = {
  createdAt: number
  text: string
  user: User
}

export type Chat = {
  id: string
  lastActive?: number
  users: User[]
  messages: Message[]
}

export type ChatsMap = { [key: Chat['id']]: Chat }
