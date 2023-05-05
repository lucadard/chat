import { getDb } from '@/firebase/firebase'
import { Message } from '@/types/types'
import { Unsubscribe, collection, limit, onSnapshot, orderBy, query } from '@firebase/firestore'
import axios from 'axios'
import { useEffect, useState } from 'react'

const fetchLimit = 20
/**
* Retrieves messages from the given chatId and
* keeps listening for new changes
*/
export const useMessages = (chatId: string): { messages: Message[], getMoreMessages: () => void, isMoreMessages: boolean } => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isMoreMessages, setIsMoreMessages] = useState(true)
  const db = getDb()

  useEffect(() => {
    if (!chatId || chatId === 'none') return
    setIsMoreMessages(true)
    let unsubscribe: Unsubscribe = () => {}
    const retrievedTime = new Date().valueOf()

    axios.get(`/api/messages/${chatId}?limit=${fetchLimit}`).then(
      ({ data }) => setMessages(data.messages)
    ).finally(() => {
      const q = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy('createdAt', 'desc'),
        limit(1)
      )
      unsubscribe = onSnapshot(q, (QuerySnapshot) => {
        const messages: any[] = []
        QuerySnapshot.forEach((doc: { data: () => any, id: any }) => {
          if (doc.data().createdAt < retrievedTime) return
          messages.push({ ...doc.data(), id: doc.id })
        })
        setMessages(prev => [...prev, ...messages])
      })
    }).catch(console.error)
    return () => { unsubscribe(); setMessages([]) }
  }, [chatId])

  function getMoreMessages () {
    axios.get(`/api/messages/${chatId}?offset=${messages.length}&limit=${fetchLimit}`)
      .then(({ data }) => {
        if (data.messages.length)setMessages(prev => ([...data.messages, ...prev]))
        else setIsMoreMessages(false)
      })
      .catch(console.error)
  }
  return { messages, getMoreMessages, isMoreMessages }
}
