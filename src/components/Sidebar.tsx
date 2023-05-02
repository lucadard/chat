import { getDb } from '@/firebase'
import { doc } from '@firebase/firestore'
import Link from 'next/link'
import React from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import Header from './Header'
import { getAvatarById } from '@/lib'
import Image from 'next/image'
import { User } from '@/context/ChatContext'

type Props = {}

const ChatList = () => {
  const db = getDb()
  const docRef = doc(db, 'users', 'lucadard')
  const [user] = useDocumentData(docRef)

  return (
    <ul className='flex flex-col'>
      <ChatCard id='general' />
      {user?.chats.map((chatId: string) => (
        <li key={chatId}>
          <ChatCard id={chatId} />
        </li>
      ))}
    </ul>
  )
}

const ChatCard = ({ id }: { id: string }) => {
  const db = getDb()
  const docRef = doc(db, 'chats', id)
  const [chat] = useDocumentData(docRef)

  if (!chat) return null

  const otherUser = (chat.users?.filter((user: User) => user.username !== 'lucadard'))[0] as User

  if (id === 'general') {
    return (
      <Link href='/chats/general' className='flex items-center gap-3 p-2 hover:bg-white/20'>
        <Image
          src='/group_icon.svg' alt=''
          height={20} width={20}
          className='h-10 w-10 rounded-full'
        />
        <span>General</span>
      </Link>
    )
  }

  return (
    <Link href={`/chats/${id}`} className='flex items-center gap-3 p-2 hover:bg-white/20'>
      <Image
        src={getAvatarById(otherUser?.id)} alt=''
        height={20} width={20}
        className='h-10 w-10 rounded-full'
      />
      <span>{otherUser?.username}</span>
    </Link>
  )
}

const Sidebar = (props: Props) => {
  return (
    <div className='flex w-[240px] flex-col gap-5 border-r border-secondary-border bg-sidebar px-3 pt-5'>
      <div className='flex items-center gap-2'>
        <Header />
      </div>
      <input type='text' className='w-full rounded-md border border-secondary-border bg-primary px-2 py-1 text-sm' placeholder='Search user' />
      <ChatList />
    </div>
  )
}

export default Sidebar
