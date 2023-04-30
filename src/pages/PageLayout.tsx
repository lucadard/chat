import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const Upper = () => {
  return (
    <div className='flex flex-col justify-end border-b border-secondary bg-nav p-5 pb-0'>
      <div className='flex items-center gap-1 pb-3 text-xl text-links'>
        <Link href='/'>chats</Link>
        <span className='text-gray-400'>/</span>
        <Link href='/' className='font-semibold'>general</Link>
      </div>
      <div className='flex gap-2'>
        <div className='flex items-center gap-2 border-b border-orange-600 p-2 pb-3'>
          <span>{'<>'}</span>
          <p>Code</p>
        </div>
        <div className='flex items-center gap-2 border-b border-orange-600 p-2 pb-3'>
          <span>◴</span>
          <p>Issues</p>
        </div>
      </div>
    </div>
  )
}

const PageLayout = ({ children }: Props) => {
  return (
    <div className='flex h-screen'>
      <Sidebar />
      <main className='flex h-screen flex-1 flex-col'>
        <Upper />
        <section className='flex basis-full flex-col justify-end pb-5'>
          {children}
        </section>
      </main>
    </div>
  )
}

export default PageLayout
