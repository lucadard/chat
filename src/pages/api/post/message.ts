
import { firestore } from '@/firebase/admin'
import { User } from '@/types/types'
import { runTransaction } from '@firebase/firestore'
import { FieldValue } from 'firebase-admin/firestore'
import { NextApiRequest, NextApiResponse } from 'next'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { chatId, message, receiver, sender } = req.body as { chatId: string, message: string, receiver: User, sender: User }

  const batch = firestore.batch()

  const messagesRef = firestore.collection(`chats/${chatId}/messages`).doc()
  batch.set(messagesRef, {
    createdAt: new Date().valueOf(),
    text: message,
    user: {
      id: sender.id,
      username: sender.username
    }
  })
  const senderRef = firestore.doc(`/users/${sender.username}`)
  const receiverRef = firestore.doc(`/users/${receiver.username}`)
  // updates lastActive field on chat document for both users
  if (chatId !== 'general') {
    batch.set(senderRef, {
      [receiver.id]: {
        chat_id: chatId,
        lastActive: new Date().valueOf(),
        name: receiver.username
      }
    }, { merge: true })
    batch.set(receiverRef, {
      [sender.id]: {
        chat_id: chatId,
        lastActive: new Date().valueOf(),
        name: sender.username
      }
    }, { merge: true })
  }

  try {
    await batch.commit()
    res.status(200).json({ data: messagesRef.id })
  } catch (err) {
    res.status(500).json({ error: err })
  }
}
