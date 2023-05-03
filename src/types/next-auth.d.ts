/* eslint-disable @typescript-eslint/no-unused-vars */
import { Session } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image: string
    }
  }
}
