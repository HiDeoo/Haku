import { type NextPage } from 'next'
import { useSession, signIn, signOut } from 'next-auth/react'

import { styled } from 'styles/stitches'

const Text = styled('div', {
  backgroundColor: '$blue10',
  variants: {
    testeroni: {
      true: {
        backgroundColor: '$slate1',
      },
    },
  },
})

const Home: NextPage = () => {
  const { data: session } = useSession()

  function login() {
    signIn()
  }

  function logout() {
    signOut({ callbackUrl: `/auth/login` })
  }

  return (
    <>
      <Text>Hello2</Text>
      <Text testeroni>Hello2</Text>
      <hr />
      <h1>{session ? 'LOGGED IN' : 'ANON'}</h1>
      {session && <div>{JSON.stringify(session.user)}</div>}
      {session ? <button onClick={logout}>Sign out</button> : <button onClick={login}>Sign in</button>}
    </>
  )
}

export default Home
