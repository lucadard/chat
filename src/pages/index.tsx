import { getSession, signOut, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import Link from 'next/link'

export default function Home () {
  const { data: session, status } = useSession()
  const { replace } = useRouter()
  const loading = status === 'loading'
  if (loading) return <div className='grid h-screen place-content-center'>loading...</div>

  return (
    <div className='grid h-screen place-content-center'>
      Home
      {session?.user
        ? <>
          <Link href='/chats/general'>
            Ir
          </Link>
          <Link
            href='/api/auth/signout'
            onClick={(e) => {
              e.preventDefault()
              void signOut({ callbackUrl: '/' })
            }}
          >Sign out
          </Link>
        </>
        : <Link href='/signin'>
          Login
          </Link>}
    </div>
  )
}
