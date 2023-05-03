import { getDb } from '@/firebase'
import { addDoc, collection, doc, query, serverTimestamp } from '@firebase/firestore'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore'
import Header from './Header'
import { getAvatarById } from '@/lib'
import Image from 'next/image'
import { User } from '@/context/ChatContext'
import { useSession } from 'next-auth/react'
import OutsideAlerter from '@/hooks/useClickOutside'

type Props = {}

const ChatList = () => {
  const { data: session } = useSession()
  const db = getDb()
  const q = query(collection(db, 'users', session!.user.name, 'chats'))
  const chats = useCollectionData(q)[0] as Array<{ id: string }> ?? []

  return (
    <ul className='flex flex-col'>
      <ChatCard id='general' />
      {chats.map(({ id }) => (
        <li key={id}>
          <ChatCard id={id} />
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
      <p className='overflow-hidden text-ellipsis'>{otherUser?.username}</p>
      <button
        className='ml-auto scale-[.7] text-sm hover:opacity-50'
        onClick={(e) => {
          e.stopPropagation()
          console.log('hola')
        }}
      >╳
      </button>
    </Link>
  )
}

type Query = {
  items: Array<{
    login: string
    id: string
  }>
}
const SearchUser = () => {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Query['items']>([])
  const [inputFocus, setInputFocus] = useState(false)

  useEffect(() => {
    if (!inputFocus) return
    if (!query) return setSearchResults([])

    async function getSearchResults (query: string) {
      const res = await fetch(`/api/github/search/${query}`)
      return (await res.json()).data
    }

    const delayDebounceFn = setTimeout(() => {
      getSearchResults(query)
        .then((data: Query) => setSearchResults(data.items.slice(0, 5)))
        .catch(console.error)
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const db = getDb()
  const { data: session } = useSession()

  async function handleSelect (user: Query['items'][0]) {
    // setQuery(user.login)
    setQuery('')
    setSearchResults([])
    setInputFocus(false)
    console.log('?')
    try {
      const chatsRef = collection(db, 'chats')
      const addedChat = await addDoc(chatsRef, {
        createdAt: serverTimestamp(),
        users: [{
          id: session?.user.id,
          username: session?.user?.name
        }, {
          id: user.id,
          username: user.login
        }]
      })

      const usersRef = collection(db, 'users', session!.user.name, 'chats')
      await addDoc(usersRef, { id: addedChat.id })
    } catch (err) {
      console.error('error writting document', err)
    }
  }

  return (
    <OutsideAlerter active={inputFocus} callback={() => setInputFocus(false)}>
      <div
        className='relative'
      >
        <input
          type='text'
          className='w-full rounded-md border border-secondary-border bg-primary px-2 py-1 text-sm outline-none' placeholder='Search user'
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setInputFocus(true)}
          value={query}
        />
        {searchResults.length !== 0 && inputFocus &&
          <ul className='absolute inset-x-0 top-full mt-2 rounded-md border border-secondary-border bg-primary py-2'>
            {searchResults.map(user =>
              <li
                key={user.id}
                className='flex cursor-pointer items-center gap-2 p-2 hover:bg-links'
                onClick={async () => await handleSelect(user)}
              >
                <Image
                  src={getAvatarById(user.id, '10')} alt=''
                  height={5} width={5}
                  className='h-5 w-5 rounded-full'
                />
                <span>
                  {user.login}
                </span>
              </li>)}
          </ul>}
      </div>
    </OutsideAlerter>
  )
}

const Sidebar = (props: Props) => {
  return (
    <div className='flex w-[240px] flex-col gap-5 border-r border-secondary-border bg-sidebar px-3 pt-5'>
      <div className='flex items-center gap-2'>
        <Header />
      </div>
      <SearchUser />
      <ChatList />
    </div>
  )
}

export default Sidebar
