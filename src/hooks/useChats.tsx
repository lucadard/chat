import { getDb } from '@/firebase/firebase'
import { filterOutFromObj } from '@/lib'
import { ChatsMap } from '@/types/types'
import { doc, onSnapshot } from '@firebase/firestore'
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
    if (!sessionUser.name) return
    const q = doc(db, 'users', sessionUser.name)
    const unsubscribe = onSnapshot(q, (DocumentSnapshot) => {
      if (!DocumentSnapshot.exists()) return
      const data = DocumentSnapshot.data() as { chats: ChatsMap }
      const filtered = filterOutFromObj(data, ['lastActive'])
      setChats(filtered)
    })
    return () => unsubscribe()
  }, [sessionUser])
  return chats
}
