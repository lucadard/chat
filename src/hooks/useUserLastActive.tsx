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
export const useUserLastActive = (username?: string): 'loading' | 'never' | string | undefined => {
  const [message, setMessage] = useState<'loading' | 'never' | string | undefined>('loading')
  const [lastActive, setLastActive] = useState<number>()
  const db = getDb()

  useEffect(() => {
    if (lastActive === undefined) return
    if (lastActive === 0) return setMessage('never')
    setMessage(dayjs(lastActive).fromNow())
    const interval = setInterval(() => {
      setMessage(dayjs(lastActive).fromNow())
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [lastActive])

  useEffect(() => {
    setMessage('loading')
    if (!username) return setMessage(undefined)
    const q = doc(db, 'users', username)

    const unsubscribe = onSnapshot(q, (DocumentSnapshot) => {
      if (!DocumentSnapshot.exists()) return setLastActive(0)

      const data = DocumentSnapshot.data() as User

      data.lastActive
        ? setLastActive(data.lastActive)
        : setLastActive(0)
    })
    return () => { unsubscribe(); setLastActive(undefined) }
  }, [username])

  return message
}
