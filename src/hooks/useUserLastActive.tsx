import { getDb } from '@/firebase/firebase'
import { doc, onSnapshot } from '@firebase/firestore'
import { type User } from '@/types/types'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

/**
* Retrieves last active from given userd
* keeps listening for new changes
*/
export const useLastActive = (username?: string): 'never' | string | undefined => {
  const [lastActive, setLastActive] = useState<string>()
  const db = getDb()

  useEffect(() => {
    if (!username) return
    const q = doc(db, 'users', username)

    const unsubscribe = onSnapshot(q, (DocumentSnapshot) => {
      if (!DocumentSnapshot.exists()) return setLastActive('never')

      const data = DocumentSnapshot.data() as User
      setLastActive(dayjs(data.lastActive).fromNow())
    })
    return () => { unsubscribe(); setLastActive(undefined) }
  }, [username])

  return lastActive
}
