import { getDb } from '@/firebase/firebase'
import { ChatsMap } from '@/types/types'
import { collection, onSnapshot, orderBy, query, where } from '@firebase/firestore'
import { User } from 'next-auth'
import { useEffect, useState } from 'react'

/**
* Retrieves chats from the given user
* and keeps listening for new changes
*/
export const useChats = (sessionUser: User): ChatsMap => {
  const [chats, setChats] = useState<ChatsMap>({})
  const db = getDb()

  useEffect(() => {
    if (!sessionUser) return
    const q = query(
      collection(db, 'chats'),
      where('users', 'array-contains', { id: sessionUser.id, username: sessionUser.name }),
      orderBy('lastActive', 'desc')
    )
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      const chats: ChatsMap = {}
      QuerySnapshot.forEach((doc: { data: () => any, id: any }) => {
        chats[doc.id] = { id: doc.id, ...doc.data() }
      })
      setChats(chats)
    })
    return () => unsubscribe()
  }, [sessionUser.id])

  return chats
}
