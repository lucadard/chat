import Sidebar from '@/components/Sidebar'
import { ChatProvider, useChat } from '@/context/ChatContext'
import { getAvatarById } from '@/lib'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useLastActive } from '@/hooks/useUserLastActive'
import { Session } from 'next-auth'

type Props = {
  session: Session
  children: React.ReactNode
}

const Upper = ({ section, setSection }: {
  section: 'chat' | 'info'
  setSection: React.Dispatch<React.SetStateAction<'chat' | 'info'>>
}) => {
  const { currentChatData } = useChat()
  const isGeneral = !currentChatData?.id
  const lastActive = useLastActive(currentChatData?.user?.username)
  return (
    <div className='flex flex-col justify-end border-b border-secondary bg-nav p-5 pb-0'>
      <div className={`h-10 cursor-default pb-3 text-xl text-links ${lastActive === 'never' ? 'opacity-50' : ''}`}>
        <span>chats</span>
        <span className='mx-1 text-gray-400'>/</span>
        <span className='font-semibold'>{currentChatData?.name}</span>
        {lastActive &&
          <span className='ml-2 text-sm text-gray-300'>
            last active: {lastActive}
          </span>}
      </div>
      <div
        className='flex gap-2'
      >
        <div
          className={`flex cursor-pointer items-center gap-2 border-orange-600 p-2 pb-3 ${section === 'chat' ? 'border-b' : ''}`}
          onClick={() => !isGeneral && setSection('chat')}
        >
          <span>{'<>'}</span>
          <p>Chat</p>
        </div>
        {!isGeneral &&
          <div
            className={`flex cursor-pointer items-center gap-2 border-orange-600 p-2 pb-3 ${section === 'info' ? 'border-b' : ''}`}
            onClick={() => !isGeneral && setSection('info')}
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
  const { currentChatData } = useChat()

  useEffect(() => {
    if (!currentChatData?.user) return

    async function getCurrentUserData (username: string) {
      const res = await fetch(`/api/github/user/${username}`)
      return (await res.json()).data
    }
    getCurrentUserData(currentChatData.user?.username).then(setUserInfo).catch(console.error)
  }, [currentChatData.user])

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

const ChatPageLayout = ({ session, children }: Props) => {
  const router = useRouter()
  const [section, setSection] = useState<'chat' | 'info'>('chat')
  useEffect(() => {
    setSection('chat')
  }, [router.query])
  return (
    <ChatProvider session={session}>
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
