import { firestore } from '@/firebase/admin'
import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
      // @ts-expect-error
      scope: 'read:user'
    })
  ],
  pages: {
    signIn: '/signin'
  },
  callbacks: {
    session (params) {
      params.session.user && firestore.doc(`/users/${params.session.user.name}`)
        .set({ lastActive: new Date().valueOf() }, { merge: true })
        .catch(console.error)
      return { ...params.session, user: { ...params.session.user, id: params.token.sub } }
    }
  }
})
