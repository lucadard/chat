import { firestore } from '@/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'
import { NextApiRequest, NextApiResponse } from 'next'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { username, id } = req.body as unknown as { username: string, id: string }
  try {
    const removed = await firestore
      .doc(`users/${username}`)
      .update({ [id]: FieldValue.delete() })

    res.status(200).json({ removed: !removed.isEqual })
  } catch (err: any) {
    res.status(500).json({ err: err.message })
  }
}
