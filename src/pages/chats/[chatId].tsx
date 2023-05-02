import { getDb } from '@/firebase'
import { Timestamp, addDoc, collection, orderBy, query, serverTimestamp } from '@firebase/firestore'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/router'
import PageLayout from '../PageLayout'
import { getSession } from 'next-auth/react'

const getAvatarById = (id: string, px = '40') => `https://avatars.githubusercontent.com/u/${id}?s=${px}&v=4`

type Message = {
  createdAt: Timestamp
  text: string
  username: string
}
const Messages = ({ chatId }: { chatId: string }) => {
  const db = getDb()
  const q = query(collection(db, `chats/${chatId}/messages`), orderBy('createdAt', 'desc'))
  const messages = useCollectionData(q)[0] as unknown as Message[]

  return (
    <ul className='flex flex-col-reverse pb-4'>
      {messages?.map((message, i) => {
        const date = message.createdAt ? message.createdAt.toDate().toLocaleString() : ''
        return (
          <li key={i} className='mx-5 flex gap-4 py-2'>
            <img src={getAvatarById('84546615')} alt='' className='h-10 w-10 rounded-full' />
            <div className='w-full'>
              <p className='whitespace-nowrap font-medium'>{message.username} <span className='text-sm font-thin'>{date}</span></p>
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
const Input = ({ userId, chatId }: { userId: string, chatId: string }) => {
  const db = getDb()
  const { register, reset, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(z.object({ message: z.string().trim().min(1).max(300) })),
    defaultValues: { message: '' }
  })

  async function handleFormSubmit (data: FormData) {
    reset()
    try {
      const chatsRef = collection(db, 'chats')
      await addDoc(collection(chatsRef, chatId, 'messages'), {
        createdAt: serverTimestamp(),
        text: data.message,
        username: userId
      })
    } catch (err) {
      console.log('error writting document', err)
    }
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

const Chat = () => {
  const router = useRouter()
  const chatId = router.query.chatId as string
  if (router.isFallback) return null

  return (
    <PageLayout>
      <div className='relative -mb-3 basis-full'>
        <div className='absolute inset-0 overflow-y-scroll'>
          <Messages chatId={chatId} />
        </div>
      </div>
      <Input userId='lucadard' chatId={chatId} />
    </PageLayout>
  )
}

export default Chat

export const getServerSideProps: any = async (ctx: any) => {
  const { req } = ctx
  const session = await getSession({ req })
  if (!session) {
    return {
      redirect: { destination: '/signin' }
    }
  }
  return {
    props: {}
  }
}
