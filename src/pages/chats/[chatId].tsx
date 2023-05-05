/* eslint-disable react/jsx-closing-tag-location */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { type GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import axios from 'axios'
import { firestore } from '@/firebase/admin'

import { getAvatarById } from '@/lib'
import { useChat } from '@/context/ChatContext'
import ChatPageLayout from '../ChatPageLayout'
import { useMessages } from '@/hooks/useMessages'
import useStayScrolled from 'react-stay-scrolled'

const Messages = () => {
  const { currentChat } = useChat()
  const { messages, getMoreMessages, isMoreMessages } = useMessages(currentChat?.chat_id ?? 'general')
  const listRef = useRef(null)
  const { stayScrolled } = useStayScrolled(listRef)

  useEffect(() => {
    stayScrolled()
  }, [messages.length])

  return (
    <div className='absolute inset-0 overflow-y-auto' ref={listRef}>
      <ul className='flex min-h-full flex-col justify-end pb-4'>
        {isMoreMessages && messages.length > 0 && <button onClick={getMoreMessages}>get moar</button>}
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
        <div id='scrollBottom' />
      </ul>
    </div>
  )
}

type FormData = { message: string }
const Input = () => {
  const { currentChat, session, removeClientChat } = useChat()
  const router = useRouter()
  const { register, reset, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(z.object({ message: z.string().trim().min(1).max(300) })),
    defaultValues: { message: '' }
  })

  async function handleFormSubmit (data: FormData) {
    reset()
    document.getElementById('scrollBottom')?.scrollIntoView()
    let newId = ''
    if (currentChat?.chat_id === 'none') {
      const { data }: { data: { id: string } } = await axios.post('/api/post/chat')
      removeClientChat(router.query.chatId as string)
      newId = data.id
    }
    const chatId = newId || (currentChat?.chat_id ?? 'general')

    try {
      await axios.post('/api/post/message', {
        chatId,
        message: data.message,
        receiver: {
          id: router.query.chatId as string,
          username: currentChat?.name
        },
        sender: {
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

  const permittedRoutes = ['general']

  const chatId = ctx.query.chatId as string
  const userRef = await firestore
    .doc(`users/${session.user.name}`)
  const doc = await userRef.get()
  const userHasPermission = Object.keys(doc.data() as {}).find(chat => chatId === chat)
  if (!userHasPermission && !permittedRoutes?.includes(chatId)) {
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
        <Messages />
      </div>
      <Input />
    </ChatPageLayout>
  )
}

export default Chat
