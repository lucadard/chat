'use client'
import { getDb } from '@/firebase'
import { Auth, GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { collection, query, orderBy, limit, serverTimestamp, addDoc } from '@firebase/firestore'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// const inter = Inter({ subsets: ['latin'] })

const SignInWithGithub = ({ auth }: { auth: Auth }) => {
  const provider = new GithubAuthProvider().addScope('user')

  async function handleSignIn () {
    const result = await signInWithPopup(auth, provider)
    console.log(result)
  }
  return (
    <button onClick={handleSignIn}>Sign in with Github</button>
  )
}

const SignOut = ({ auth }: { auth: Auth }) => {
  return (
    <button onClick={async () => await signOut(auth)}>Sign out</button>
  )
}

const Messages = () => {
  const db = getDb()
  const messagesRef = collection(db, 'messages')
  const q = query(messagesRef, orderBy('createdAt'))
  const [messages] = useCollectionData(q)
  return (
    <ul className='flex flex-col-reverse pb-4'>
      {messages?.reverse().map((message, i) =>
        <li key={i} className='mx-5 flex gap-4 py-2'>
          <div className='h-10 w-10 rounded-full bg-white' />
          <div>
            <p className='font-medium'>Nombre <span className='text-sm font-thin'>fecha y hora</span></p>
            <p className='text-base'>
              {message.text}
            </p>
          </div>
        </li>)}
    </ul>
  )
}

type FormData = {
  message: string
}
const Input = ({ userId }: { userId: string }) => {
  const db = getDb()
  const { register, reset, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(z.object({ message: z.string().trim().min(1) })),
    defaultValues: { message: '' }
  })

  async function handleFormSubmit (data: FormData) {
    reset()
    try {
      const docRef = await addDoc(collection(db, 'messages'), {
        createdAt: serverTimestamp(),
        text: data.message,
        userId
      })
      console.log('document written ID:', docRef.id)
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

const Upper = () => {
  return (
    <div className='flex flex-col justify-end border-b border-secondary bg-nav p-5 pb-0'>
      <div className='flex items-center gap-1 pb-3 text-xl text-links'>
        <a href='/'>chats</a>
        <span className='text-gray-400'>/</span>
        <a href='/' className='font-semibold'>general</a>
      </div>
      <div className='flex gap-2'>
        <div className='flex items-center gap-2 border-b border-orange-600 p-2 pb-3'>
          <span>{'<>'}</span>
          <p>Code</p>
        </div>
        <div className='flex items-center gap-2 border-b border-orange-600 p-2 pb-3'>
          <span>◴</span>
          <p>Issues</p>
        </div>

      </div>
    </div>
  )
}

export default function Home () {
  return (
    <main className='flex h-screen flex-col'>
      <Upper />
      <section className='flex basis-full flex-col justify-end pb-5'>
        <div className='relative -mb-3 basis-full'>
          <div className='absolute inset-0 overflow-y-scroll'>
            <Messages />
          </div>
        </div>
        <Input userId='xDD' />
      </section>
    </main>
  )
}
