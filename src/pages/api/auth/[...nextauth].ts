import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      // @ts-expect-error
      scope: 'read:user'
    })
  ],
  pages: {
    signIn: '/signin'
  },
  callbacks: {
    async signIn (data) { console.log(data); return true }
  }
})
