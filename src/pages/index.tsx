'use client'
import { Auth, GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import PageLayout from './PageLayout'

// const inter = Inter({ subsets: ['latin'] })

const SignInWithGithub = ({ auth }: { auth: Auth }) => {
  const provider = new GithubAuthProvider().addScope('user')

  async function handleSignIn () {
    const result = await signInWithPopup(auth, provider)
    console.log(result)
  }
  return (
    <button onClick={handleSignIn}>Sign in with Github</button>
  )
}

const SignOut = ({ auth }: { auth: Auth }) => {
  return (
    <button onClick={async () => await signOut(auth)}>Sign out</button>
  )
}

export default function Home ({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p>/</p>
    </div>
  )
}
