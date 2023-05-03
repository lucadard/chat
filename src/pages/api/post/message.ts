import { User } from '@/context/ChatContext'
import { firestore } from '@/firebase/admin'
import { NextApiRequest, NextApiResponse } from 'next'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { chatId, message, user } = req.body as { chatId: string, message: string, user: User }
  const added = await firestore.collection(`chats/${chatId}/messages`).add({
    createdAt: new Date().valueOf(),
    text: message,
    user: {
      id: user.id,
      username: user.username
    }
  })

  // updates lastActive field on chat document & user
  firestore.doc(`/chats/${chatId}`)
    .set({ lastActive: new Date().valueOf() }, { merge: true })
    .catch(console.error)

  firestore.doc(`/users/${user.username}`)
    .set({ lastActive: new Date().valueOf() }, { merge: true })
    .catch(console.error)

  res.status(200).json({ data: added.id })
}
