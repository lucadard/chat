import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import OutsideAlerter from '@/hooks/useClickOutside'

// The approach used in this component shows how to built a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header () {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  if (!session?.user) return null

  return (
    <OutsideAlerter active={open} callback={() => setOpen(false)}>
      <header className='relative flex w-full items-center justify-between'>
        <div
          onClick={() => setOpen(prev => !prev)}
          className='group flex cursor-pointer items-center'
        >
          <img src={session.user.image ?? ''} alt='' className='h-5 w-5 rounded-full border border-transparent outline outline-[1px] outline-secondary-border' />
          <span className='-mt-1 block -rotate-45 scale-[.3] group-hover:text-white/80'>◣</span>
          {/* <span>{session.user.name}</span> */}
        </div>
        {open &&
          <div className='absolute left-0 top-full'>
            <ul className='mt-2 rounded-lg border border-secondary-border bg-nav py-2'>
              <li className='cursor-default px-4 py-1'>
                <p className='whitespace-nowrap'>
                  Signed in as <strong>{session.user.name}</strong>
                </p>
              </li>
              <div className='my-2 h-[1px] bg-secondary-border' />
              <Link
                href='/api/auth/signout'
                onClick={(e) => {
                  e.preventDefault()
                  void signOut({ callbackUrl: '/' })
                }}
              >
                <li className='px-4 py-1 hover:bg-links'>
                  Sign out
                </li>
              </Link>
            </ul>
          </div>}
      </header>
    </OutsideAlerter>
  )
}
