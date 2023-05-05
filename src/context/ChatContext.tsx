import { useChats } from '@/hooks/useChats'
import { filterOutFromObj } from '@/lib'
import { type Chat, ChatsMap } from '@/types/types'
import { type Session } from 'next-auth'
import { useRouter } from 'next/router'
import { createContext, useContext, ReactNode, useState } from 'react'

type State = {
  currentChat: Chat | undefined
  chats: ChatsMap
  session?: Session
  setClientChat: (id: string, chat: Chat) => void
  removeClientChat: (id: string) => void
}
type ChatProviderProps = { session: Session, children: ReactNode }

const ChatStateContext = createContext<State | undefined>(undefined)

function ChatProvider ({ session, children }: ChatProviderProps) {
  const [clientChats, setClientChats] = useState<ChatsMap>({})
  const router = useRouter()
  const chats: ChatsMap = { ...clientChats, ...useChats(session?.user) }
  const receiverId = router.query.chatId as keyof typeof chats
  const currentChat = chats[receiverId] as Chat

  const value = {
    currentChat,
    chats,
    session,
    setClientChat: (id: string, chat: Chat) => { setClientChats(prev => ({ ...prev, [id]: chat })) },
    removeClientChat: (newId: string) => { setClientChats(prev => filterOutFromObj(prev, [newId])) }
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
