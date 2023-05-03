import { User } from '@/context/ChatContext'
import { firestore } from '@/firebase/admin'
import { NextApiRequest, NextApiResponse } from 'next'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  // TO DO -> set lastActive on chatId
  const { chatId, message, user } = req.body as { chatId: string, message: string, user: User }
  const added = await firestore.collection(`chats/${chatId}/messages`).add({
    createdAt: new Date().valueOf(),
    text: message,
    user: {
      id: user.id,
      username: user.username
    }
  })

  res.status(200).json({ data: added.id })
}
