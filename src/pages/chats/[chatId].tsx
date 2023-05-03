/* eslint-disable react/jsx-closing-tag-location */
import { getDb } from '@/firebase/firebase'
import { collection, orderBy, query } from '@firebase/firestore'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import ChatPageLayout from '../ChatPageLayout'
import { getSession, useSession } from 'next-auth/react'
import { getAvatarById } from '@/lib'
import Image from 'next/image'
import { type GetServerSideProps } from 'next'
import { useChat } from '@/context/ChatContext'
import { firestore } from '@/firebase/admin'
import axios from 'axios'

type Message = {
  createdAt: string
  text: string
  user: {
    id: string
    username: string
  }
}
const Messages = () => {
  const { id: chatId } = useChat()
  const db = getDb()
  const q = query(collection(db, `chats/${chatId}/messages`), orderBy('createdAt', 'asc'))
  const messages = useCollectionData(q)[0] as unknown as Message[]

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

type FormData = {
  message: string
}
const Input = () => {
  const { id: chatId } = useChat()
  const { data: session } = useSession()
  const { register, reset, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(z.object({ message: z.string().trim().min(1).max(300) })),
    defaultValues: { message: '' }
  })

  async function handleFormSubmit (data: FormData) {
    reset()
    try {
      await axios.post('/api/post/message', {
        chatId,
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

  const chatId = ctx.query.chatId
  let userHasPermission = false
  const docs = await firestore
    .collection(`users/${session.user.name}/chats`)
    .get()
  docs.forEach(doc => { if (doc.data().id === chatId) { userHasPermission = true } })

  if (!userHasPermission && chatId !== 'general') {
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

const Chat = () => {
  return (
    <ChatPageLayout>
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
