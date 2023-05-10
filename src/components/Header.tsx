import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import OutsideAlerter from '@/hooks/useClickOutside'
import Image from 'next/image'
import { useChat } from '@/context/ChatContext'

export default function Header () {
  const { session } = useChat()
  const [open, setOpen] = useState(false)

  return (
    <OutsideAlerter active={open} callback={() => setOpen(false)}>
      <header className='relative z-10 flex w-full select-none items-center justify-between'>
        <div
          onClick={() => setOpen(prev => !prev)}
          className='group flex cursor-pointer items-center'
        >
          <Image
            src={session?.user.image ?? ''} alt=''
            height={20} width={20}
            className='h-5 w-5 rounded-full border border-transparent outline outline-[1px] outline-secondary-border'
          />
          <span className='-mt-1 block -rotate-45 scale-[.3] group-hover:text-white/80'>◣</span>
          {/* <span>{session.user.name}</span> */}
        </div>
        {open &&
          <div className='absolute left-0 top-full'>
            <ul className='mt-2 rounded-lg border border-secondary-border bg-nav py-2'>
              <li className='cursor-default px-4 py-1'>
                <p className='whitespace-nowrap'>
                  Signed in as <strong>{session?.user.name}</strong>
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
