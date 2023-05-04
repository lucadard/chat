import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Header from './Header'
import { getAvatarById } from '@/lib'
import Image from 'next/image'
import { useChat } from '@/context/ChatContext'
import OutsideAlerter from '@/hooks/useClickOutside'
import { Chat } from '@/types/types'

const ChatList = () => {
  const { chats, newChat } = useChat()

  return (
    <ul className='flex flex-col'>
      <Link href='/chats/general'>
        <ChatCard isGeneral />
      </Link>
      <Link href='/chats/new'>
        <ChatCard chat={newChat} />
      </Link>
      {Object.entries(chats).map(([id, chat]) => {
        return (
          <Link key={id} href={`/chats/${id}`}>
            <ChatCard chat={chat} />
          </Link>
        )
      }
      )}
    </ul>
  )
}

const ChatCard = ({ chat, isGeneral = false }: { chat?: Chat | undefined, isGeneral?: boolean }) => {
  const { session } = useChat()
  if (isGeneral) {
    return (
      <li className='flex items-center gap-3 p-2 hover:bg-white/20'>
        <Image
          src='/group_icon.svg' alt=''
          height={20} width={20}
          className='h-10 w-10 rounded-full'
        />
        <span>General</span>
      </li>
    )
  }

  if (!chat) return null
  const [displayedUser] = (chat?.users?.filter(user => user.username !== session?.user.name))
  return (
    <li className='flex items-center gap-3 p-2 hover:bg-white/20'>
      <Image
        src={getAvatarById(displayedUser.id)} alt=''
        height={20} width={20}
        className='h-10 w-10 rounded-full'
      />
      <p className='overflow-hidden text-ellipsis'>{displayedUser.username}</p>
    </li>
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
  const { setNewChat, session } = useChat()
  useEffect(() => {
    if (!inputFocus) return
    if (!query) return setSearchResults([])

    async function getSearchResults (query: string) {
      const res = await fetch(`/api/github/search/${query}`)
      return (await res.json()).data
    }

    const delayDebounceFn = setTimeout(() => {
      getSearchResults(query)
        .then((data: Query) =>
          setSearchResults(data.items
            .filter(u => u.login !== session?.user.name)
            .slice(0, 5)))
        .catch(console.error)
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [query])

  async function handleSelect (user: Query['items'][0]) {
    setQuery('')
    setSearchResults([])
    setInputFocus(false)
    setNewChat({
      id: user.id,
      messages: [],
      users: [
        { id: user.id, username: user.login },
        { id: session!.user.id, username: session!.user.name }
      ]
    })
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

const Sidebar = () => {
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
