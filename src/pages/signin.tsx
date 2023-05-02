import { Provider } from 'next-auth/providers'
import { getProviders, signIn, getSession, getCsrfToken } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'

export const getServerSideProps: GetServerSideProps | {} = async (ctx: any) => {
  const { req } = ctx
  const session = await getSession({ req })
  if (session) {
    return {
      redirect: { destination: '/' }
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
    <div>
      {Object.values(providers).map((provider) => {
        return (
          <div
            key={provider.name}
            className='flex h-screen flex-col items-center gap-5 bg-white pt-[30vh] text-black'
          >
            <h1 className='mb-2 text-center text-3xl font-semibold'>Welcome</h1>
            <button
              className='rounded-sm border-2 p-4 px-8 duration-200 hover:bg-gray-100/50'
              onClick={async () => await signIn(provider.id, { callbackUrl: '/chats/general' })}
            >
              Sign in with {provider.name}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default SignInPage
