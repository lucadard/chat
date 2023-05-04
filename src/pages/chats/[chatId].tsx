/* eslint-disable react/jsx-closing-tag-location */
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import ChatPageLayout from '../ChatPageLayout'
import { getSession, useSession } from 'next-auth/react'
import { getAvatarById } from '@/lib'
import Image from 'next/image'
import { type GetServerSideProps } from 'next'
import { ChatProvider, useChat } from '@/context/ChatContext'
import { useMessages } from '@/hooks/useMessages'
import { Session } from 'next-auth'
import axios from 'axios'
import { firestore } from '@/firebase/admin'

const Messages = () => {
  const { messages } = useChat()
  return (
    <ul className='flex flex-col pb-4'>
      {messages?.map((message, i) => {
        const date = message.createdAt ? new Date(message.createdAt).toLocaleString() : ''
        return (
          <li key={i} className='mx-5 flex gap-4 py-2'>
            <Image
              src={getAvatarById(message.user.id)} alt=''
              height={20} width={20}
              className='h-10 w-10 rounded-full'
            />
            <div className='w-full'>
              <p className='whitespace-nowrap font-medium'>{message.user?.username} <span className='text-sm font-thin'>{date}</span></p>
              <p className='break-all text-base'>
                {message.text}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

type FormData = { message: string }
const Input = () => {
  const { currentChatData, removeNewChat, session } = useChat()
  const { register, reset, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(z.object({ message: z.string().trim().min(1).max(300) })),
    defaultValues: { message: '' }
  })

  async function handleFormSubmit (data: FormData) {
    let newChatId = ''
    if (currentChatData?.id === 'new') {
      try {
        const res = await axios.post<{ id: string }>('/api/post/chat', {
          users: [{
            id: session?.user.id,
            username: session?.user.name
          }, {
            id: currentChatData.user?.id,
            username: currentChatData.user?.username
          }]
        })
        newChatId = res.data.id
        removeNewChat()
      } catch (err) { console.error('Could not create new chat...') }
    }
    reset()
    try {
      await axios.post('/api/post/message', {
        chatId: newChatId || (currentChatData?.id ?? 'general'),
        message: data.message,
        user: {
          id: session?.user.id,
          username: session?.user?.name
        }
      })
    } catch (err) { console.error('Could not send message...') }
  }

  return (
    <form
      className='text-border-secondary z-10 mx-5 flex rounded-xl border border-secondary-border bg-secondary'
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <button className='flex items-center justify-center p-3 px-5'>
        <span className='bg-border-secondary grid aspect-square h-6 w-6 place-content-center rounded-full bg-secondary-text text-sm text-secondary'>
          ➤
        </span>
      </button>
      <input
        {...register('message')}
        type='text'
        className='w-full bg-transparent outline-none'
        placeholder='Enviar mensaje'
      />
    </form>
  )
}

export const getServerSideProps: GetServerSideProps | {} = async (ctx) => {
  const { req } = ctx
  const session = await getSession({ req })
  if (!session) {
    return {
      redirect: { destination: '/signin' }
    }
  }

  const permittedRoutes = ['general', 'new']

  const chatId = ctx.query.chatId as string
  let userHasPermission = false
  const docs = await firestore
    .collection(`users/${session.user.name}/chats`)
    .get()
  docs.forEach(doc => { if (doc.data().id === chatId) { userHasPermission = true } })

  if (!userHasPermission && permittedRoutes?.includes(chatId)) {
    return {
      redirect: { destination: '/chats/general' }
    }
  }

  return {
    props: {
      session
    }
  }
}

const Chat = ({ session }: { session: Session }) => {
  return (
    <ChatPageLayout session={session}>
      <div className='relative -mb-3 basis-full'>
        <div className='absolute inset-0 overflow-y-scroll'>
          <Messages />
        </div>
      </div>
      <Input />
    </ChatPageLayout>
  )
}

export default Chat
