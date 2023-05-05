import { getDb } from '@/firebase/firebase'
import { Message } from '@/types/types'
import { collection, limit, onSnapshot, orderBy, query } from '@firebase/firestore'
import { useEffect, useState } from 'react'
/**
* Retrieves messages from the given chatId and
* keeps listening for new changes
*/
export const useMessages = (chatId: string): Message[] => {
  const [messages, setMessages] = useState<Message[]>([])
  const db = getDb()

  useEffect(() => {
    if (!chatId || chatId === 'none') return setMessages([])
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      const messages: any[] = []
      QuerySnapshot.forEach((doc: { data: () => any, id: any }) => {
        messages.push({ ...doc.data(), id: doc.id })
      })
      setMessages(messages)
    })
    return () => unsubscribe()
  }, [chatId])

  return messages
}
