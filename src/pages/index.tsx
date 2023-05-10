/* eslint-disable react/jsx-closing-tag-location */
import { Session } from 'next-auth'
import { getSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { GetServerSideProps } from 'next/types'
import { Button } from './components/Button'
import { IBM_Plex_Sans } from 'next/font/google'
import { useState } from 'react'

export const getServerSideProps: GetServerSideProps | {} = async (ctx) => {
  const { req } = ctx
  const session = await getSession({ req })
  return {
    props: {
      session
    }
  }
}

const NavItem = ({ href = '/', children, target = '_self' }: { href?: string, children: React.ReactNode, target?: string }) => {
  return (
    <Link href={href} target={target} className='group relative block cursor-pointer rounded-xl p-3 px-6'>
      <div className=' absolute inset-0 scale-[0.8] rounded-xl bg-secondary-text/80 opacity-0 duration-200 ease-in-out group-hover:scale-100 group-hover:opacity-50' />
      <span className='text-base'>{children}</span>
    </Link>
  )
}

const WithLove = () => {
  const [hover, setHover] = useState(false)
  function toggleHover () { setHover(prev => !prev) }
  return (
    <div className='mt-auto cursor-default p-3 px-5 text-end text-white/70'>
      with <p className={`inline-block duration-200 ${hover ? '-translate-y-2' : ''}`}>♥︎</p> by{' '}
      <Link
        href='https://github.com/lucadard'
        target='_blank' rel='noreferrer'
        className='underline duration-300 hover:text-white'
        onMouseEnter={toggleHover}
        onMouseLeave={toggleHover}
      >lucadard</Link></div>
  )
}

const ibm = IBM_Plex_Sans({ weight: ['400', '500'], subsets: ['latin'] })

export default function Home ({ session }: { session: Session }) {
  return (
    <div className='flex h-screen flex-col'>
      <nav className='mx-20 grid grid-cols-3 items-center py-5'>
        <Link href='/' style={ibm.style} className='text-xl font-semibold tracking-wide'>
          <p>Gitcord</p>
        </Link>
        <ul className='flex w-full justify-center gap-5'>
          <li>
            <NavItem href='https://github.com/lucadard/chat' target='_blank'>Repository</NavItem>
          </li>
          <li>
            <NavItem href='https://lucadar.vercel.app/' target='_blank'>About</NavItem>
          </li>
        </ul>
        <div className='place-self-end self-center'>
          {session?.user
            ? <Link
                href='/api/auth/signout'
                onClick={(e) => {
                  e.preventDefault()
                  void signOut({ callbackUrl: '/' })
                }}
              ><Button type='default'>logout</Button></Link>
            : <Link href='/signin'><Button type='default'>login</Button></Link>}
        </div>
      </nav>
      <main className='flex flex-col items-center'>
        <h1 style={ibm.style} className='pt-[20vh] text-center text-7xl font-bold'>
          <p className='flex justify-center gap-4'>Say hello
            <Image
              src='/waving-hand.png' alt='waving hand emoji'
              width={60} height={60}
              className='object-contain hover:animate-hi'
            />
          </p>
          <p>To another dev.</p>
        </h1>
        <Link href={session?.user ? '/chats/general' : '/signin'} className='mt-10 inline-block scale-150'><Button type='default'>Open app</Button></Link>
      </main>
      <WithLove />
    </div>
  )
}
