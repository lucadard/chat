import { getDb } from '@/firebase'
import { doc, getDoc } from '@firebase/firestore'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { createContext, useContext, ReactNode, useEffect, useState } from 'react'

export type User = {
  id: string
  username: string
}

type State = { id: string, name: string, userData: User | undefined }
type ChatProviderProps = { children: ReactNode }

const ChatStateContext = createContext<State | undefined>(undefined)

function ChatProvider ({ children }: ChatProviderProps) {
  const { query } = useRouter()
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const chatId = query.chatId as string
  const db = getDb()

  useEffect(() => {
    if (!chatId) return
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const docSnap = getDoc(doc(db, 'chats', chatId)).then(
      docSnap => docSnap.exists() && setUsers(docSnap.data().users as User[]))
  }, [chatId])

  const userData = users?.filter((user: User) => user.username !== session?.user?.name)[0] ?? undefined

  const value = {
    id: chatId,
    name: chatId === 'general' || !userData ? 'general' : userData.username,
    userData
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
