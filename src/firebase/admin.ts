import { ServiceAccount, initializeApp } from 'firebase-admin/app'
import { credential } from 'firebase-admin'

import { getFirestore } from 'firebase-admin/firestore'

try {
  initializeApp({
    credential: credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEYS as string) as ServiceAccount),
    databaseURL: 'firebase-adminsdk-shhbt@chat-app-c9ff3.iam.gserviceaccount.com'
  })
} catch (err) {
  // console.error(err)
}

export const firestore = getFirestore()
