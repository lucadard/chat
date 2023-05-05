import { firestore } from '@/firebase/admin'
import { NextApiRequest, NextApiResponse } from 'next'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const added = await firestore.collection('chats').add({})
    res.status(200).json({ id: added.id })
  } catch (err) {
    res.status(500).json({ err })
  }
}
