import { firestore } from '@/firebase/admin'
import { User } from '@/types/types'
import { NextApiRequest, NextApiResponse } from 'next'

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { users } = req.body as { users: User[] }
  const added = await firestore.collection('chats').add({
    lastActive: new Date().valueOf(),
    users: [{
      id: users[0].id,
      username: users[0].username
    }, {
      id: users[1].id,
      username: users[1].username
    }]
  })
  // adds reference to chat in each user
  users.forEach(user => {
    void firestore.collection(`users/${user.username}/chats`).add({ id: added.id })
  })

  res.status(200).json({ id: added.id })
}
