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
  const q = query(messagesRef, orderBy('createdAt'), limit(25))
  const [messages] = useCollectionData(q)
  return (
    <ul className='ml-5 flex flex-col-reverse overflow-y-scroll pb-4'>
      {messages?.reverse().map((message, i) =>
        <li key={i} className='flex gap-4 py-2'>
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
      className='mx-5 flex rounded-xl bg-gray-600'
      onSubmit={handleSubmit(handleFormSubmit)}
    >
      <button className='flex items-center justify-center p-3 px-5 text-black'>
        <span className='grid aspect-square h-6 w-6 place-content-center rounded-full bg-white text-sm'>
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

export default function Home () {
  return (
    <main className='flex h-full flex-col'>
      <section className='flex h-[90%] flex-col justify-end border pb-5'>
        <Messages />
        <Input userId='xDD' />
      </section>
    </main>
  )
}
