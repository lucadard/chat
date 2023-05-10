import { Provider } from 'next-auth/providers'
import { getProviders, signIn, getSession, getCsrfToken } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import Image from 'next/image'
import Link from 'next/link'

export const getServerSideProps: GetServerSideProps | {} = async (ctx) => {
  const { req } = ctx
  const session = await getSession({ req })
  if (session) {
    return {
      redirect: { destination: '/chats/general' }
    }
  }

  return {
    props: {
      providers: await getProviders(),
      csrfToken: await getCsrfToken()
    }
  }
}

function SignInPage ({ providers }: { providers: Provider[] }) {
  return (
    <div className='-mt-10 grid h-screen place-content-center'>
      <div className='flex w-full max-w-md flex-col items-center rounded-md bg-secondary p-14 py-10 shadow-lg'>
        {Object.values(providers).map((provider) =>
          <button
            key={provider.name}
            className='flex items-center gap-3 rounded-md bg-links p-4 px-8 text-lg font-medium duration-200 hover:bg-links/50'
            onClick={async () => await signIn(provider.id, { callbackUrl: '/chats/general' })}
          >
            Sign in with {provider.name}
            <Image
              src='/github-logo.png' alt='logo of Github'
              height={30} width={30}
            />
          </button>
        )}
        <p className='mt-4'>or instead <Link href='/' className='text-start text-links duration-200 hover:underline'>go back</Link></p>
      </div>
    </div>
  )
}

export default SignInPage
