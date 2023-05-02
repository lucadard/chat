import { getDb } from '@/firebase'
import { doc } from '@firebase/firestore'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { createContext, useContext, ReactNode } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'

export type User = {
  id: string
  username: string
}

type State = { id: string, name: string, userData: User | undefined }
type ChatProviderProps = { children: ReactNode }

const ChatStateContext = createContext<State | undefined>(undefined)

function ChatProvider ({ children }: ChatProviderProps) {
  const { query } = useRouter()
  const chatId = query.chatId as string
  const db = getDb()
  const docRef = doc(db, 'chats', chatId)
  const [chat] = useDocumentData(docRef)
  const { data: session } = useSession()

  const users: User[] = chat?.users
    ?.filter((user: User) => user.username !== session?.user?.name) ?? []

  const value = {
    id: chatId,
    name: chatId === 'general' || !users ? 'general' : users[0]?.username,
    userData: users[0]
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
