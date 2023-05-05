export type User = {
  lastActive?: number
  id: string
  username: string
}

export type Message = {
  createdAt: number
  text: string
  user: User
}

export type Chat = {
  chat_id: string
  name: string
  lastActive: number
}

export type ChatsMap = { [key: Chat['id']]: Chat }
