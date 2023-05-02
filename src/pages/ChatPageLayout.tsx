import Sidebar from '@/components/Sidebar'
import { ChatProvider, useChat } from '@/context/ChatContext'
import { getAvatarById } from '@/lib'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type Props = {
  children: React.ReactNode
}

const Upper = ({ section, setSection }: {
  section: 'chat' | 'info'
  setSection: React.Dispatch<React.SetStateAction<'chat' | 'info'>>
}) => {
  const { name: chatName, id } = useChat()
  const disable = id === 'general'
  return (
    <div className='flex flex-col justify-end border-b border-secondary bg-nav p-5 pb-0'>
      <div className='flex cursor-default items-center gap-1 pb-3 text-xl text-links'>
        <span>chats</span>
        <span className='text-gray-400'>/</span>
        <span className='font-semibold'>{chatName}</span>
      </div>
      <div
        className='flex gap-2'
      >
        <div
          className={`flex cursor-pointer items-center gap-2 border-orange-600 p-2 pb-3 ${section === 'chat' ? 'border-b' : ''}`}
          onClick={() => !disable && setSection('chat')}
        >
          <span>{'<>'}</span>
          <p>Chat</p>
        </div>
        {!disable &&
          <div
            className={`flex cursor-pointer items-center gap-2 border-orange-600 p-2 pb-3 ${section === 'info' ? 'border-b' : ''}`}
            onClick={() => !disable && setSection('info')}
          >
            <span>◴</span>
            <p>User</p>
          </div>}
      </div>
    </div>
  )
}

const UserData = () => {
  const [userInfo, setUserInfo] = useState<any>(undefined)
  const { userData } = useChat()

  useEffect(() => {
    if (!userData) return

    async function getUserData (username: string) {
      const res = await fetch(`/api/github/user/${username}`)
      return (await res.json()).data
    }
    getUserData(userData.username).then(setUserInfo).catch(console.error)
  }, [userData])

  if (!userInfo) return null

  return (
    <div>
      <Image
        src={getAvatarById(userInfo?.id, '256')} alt=''
        height={256} width={256}
        className='h-[256px] w-[256px] rounded-full'
      />
      <p>{userInfo?.name}</p>
      <p><Link href={userInfo?.html_url}>view profile</Link></p>
      <p>blog <Link href={userInfo?.blog}>{userInfo?.blog}</Link></p>
      {userInfo?.twitter && <p>twitter {userInfo?.twitter}</p>}
      <p>following: {userInfo?.following}</p>
      <p>followers: {userInfo?.followers}</p>
      <p>repositories: {userInfo?.public_repos}</p>
    </div>
  )
}

const ChatPageLayout = ({ children }: Props) => {
  const router = useRouter()
  const [section, setSection] = useState<'chat' | 'info'>('chat')
  useEffect(() => {
    setSection('chat')
  }, [router.query])
  return (
    <ChatProvider>
      <div className='flex h-screen'>
        <Sidebar />
        <main className='flex h-screen flex-1 flex-col'>
          <Upper section={section} setSection={setSection} />
          <section className={`flex basis-full flex-col justify-end pb-5 ${section !== 'chat' ? 'hidden' : ''}`}>
            {children}
          </section>
          <div className={`${section !== 'info' ? 'hidden' : ''}`}>
            <UserData />
          </div>
        </main>
      </div>
    </ChatProvider>
  )
}

export default ChatPageLayout
