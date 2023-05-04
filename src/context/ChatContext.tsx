import { useChats } from '@/hooks/useChats'
import { useMessages } from '@/hooks/useMessages'
import { type Chat, ChatsMap, User, Message } from '@/types/types'
import { type Session } from 'next-auth'
import { useRouter } from 'next/router'
import { createContext, useContext, ReactNode, useState, useEffect } from 'react'

type State = {
  currentChatData: {
    lastActive?: number
    id: string
    name: string | undefined
    user?: User
  }
  chats: ChatsMap
  messages: Message[]
  newChat: Chat | undefined
  setNewChat: (chat: Chat) => void
  removeNewChat: () => void
  session?: Session
}
type ChatProviderProps = { session: Session, children: ReactNode }

const ChatStateContext = createContext<State | undefined>(undefined)

function ChatProvider ({ session, children }: ChatProviderProps) {
  const [newChat, setNewChat] = useState<Chat>()
  const [selectedChat, setSelectedChat] = useState<keyof ChatsMap>('general')

  const router = useRouter()
  const chatId = router.query.chatId as string

  const chats = useChats(session.user)
  const currentChat = chats[selectedChat]
  const currentUserData = currentChat?.users.filter((user) => user.username !== session?.user?.name)[0] ?? newChat?.users[0]

  const messages = useMessages(selectedChat !== 'new' ? chatId ?? 'general' : 'none')

  useEffect(() => { setSelectedChat(chatId) }, [chatId])

  const value = {
    currentChatData: {
      id: selectedChat === 'new' ? 'new' : chatId,
      lastActive: currentChat?.lastActive,
      user: currentUserData,
      name: selectedChat === 'new' ? newChat?.users[0].username : currentUserData?.username ?? 'general'
    },
    newChat,
    chats,
    messages,
    removeNewChat: () => { setNewChat(undefined) },
    setNewChat: (chat: Chat) => {
      setNewChat(chat)
      void router.push('/chats/new', undefined, { shallow: true })
      setSelectedChat('new')
    },
    session
  }
  return (
    <ChatStateContext.Provider value={value}>
      {children}
    </ChatStateContext.Provider>
  )
}

function useChat () {
  const context = useContext(ChatStateContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

export { ChatProvider, useChat }
