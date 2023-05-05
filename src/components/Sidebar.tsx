import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Header from './Header'
import { getAvatarById } from '@/lib'
import Image from 'next/image'
import { useChat } from '@/context/ChatContext'
import OutsideAlerter from '@/hooks/useClickOutside'
import { Chat } from '@/types/types'
import { useRouter } from 'next/router'

const ChatList = () => {
  const { chats } = useChat()
  const router = useRouter()

  const chatList = Object.entries(chats) as unknown as Array<[string, Chat]>
  return (
    <ul className='flex flex-col'>
      <Link
        onClick={(e) => {
          e.preventDefault()
          void router.push('/chats/general', undefined, { shallow: true })
        }}
        href='/chats/general'
      >
        <ChatCard isGeneral />
      </Link>
      {chatList.sort(([_a, chatA], [_b, chatB]) => chatB.lastActive - chatA.lastActive).map(([id, chat]) => {
        return (
          <Link
            key={id}
            onClick={(e) => {
              e.preventDefault()
              void router.push(`/chats/${id}`, undefined, { shallow: true })
            }}
            href={`/chats/${id}`}
          >
            <ChatCard id={id} info={chat} />
          </Link>
        )
      }
      )}
    </ul>
  )
}

const ChatCard = ({ id, info, isGeneral = false }: { id?: string, info?: Chat | undefined, isGeneral?: boolean }) => {
  const { query } = useRouter()
  const selectedChat = query.chatId
  if (isGeneral) {
    return (
      <li className={`flex items-center gap-3 rounded-sm p-2  ${selectedChat === 'general' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
        <Image
          src='/group_icon.svg' alt=''
          height={20} width={20}
          className='h-10 w-10 rounded-full'
        />
        <span>General</span>
      </li>
    )
  }
  if (!info || !id) return null
  return (
    <li className={`flex items-center gap-3 p-2 ${selectedChat === id ? 'bg-white/20' : 'hover:bg-white/10'}`}>
      <Image
        src={getAvatarById(id)} alt=''
        height={20} width={20}
        className='h-10 w-10 rounded-full'
      />
      <p className='overflow-hidden text-ellipsis'>{info.name}</p>
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
  const { session, chats, setClientChat } = useChat()
  const router = useRouter()
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

  function handleSelect (user: Query['items'][0]) {
    setQuery('')
    setSearchResults([])
    setInputFocus(false)
    if (!Object.keys(chats).includes(`${user.id}`)) {
      setClientChat(user.id, {
        chat_id: 'none',
        lastActive: new Date().valueOf(),
        name: user.login
      })
    }
    void router.push(`/chats/${user.id}`, undefined, { shallow: true })
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
                onClick={() => handleSelect(user)}
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
