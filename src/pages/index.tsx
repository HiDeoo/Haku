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

  return (
    <>
      <Text>Hello2</Text>
      <Text testeroni>Hello2</Text>
      <hr />
      <h1>{session ? 'LOGGED IN' : 'ANON'}</h1>
      <button onClick={() => signIn()}>Sign in</button>
      <button onClick={() => signOut()}>Sign out</button>
    </>
  )
}

export default Home
