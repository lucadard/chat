import { firestore } from '@/firebase/admin'
import { Message } from '@/types/types'
import { NextApiRequest, NextApiResponse } from 'next'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  let { chatId, limit, offset } = req.query as unknown as { chatId: string, limit?: number, offset?: number }
  limit = limit !== undefined ? +limit : 20
  offset = offset !== undefined ? +offset : 0

  const messages: Message[] = []
  try {
    const messagesRef = firestore
      .collection(`chats/${chatId}/messages`)
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit)
    const snapshot = await messagesRef.get()
    snapshot.forEach(doc => {
      messages.push(doc.data() as Message)
    })

    res.status(200).json({ messages: messages.reverse() })
  } catch (err: any) {
    res.status(500).json({ err: err.message })
  }
}
