import { type NextPage } from 'next'
import { signOut } from 'next-auth/react'

import useUser from 'hooks/useUser'
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
  const user = useUser()

  function logout() {
    signOut({ callbackUrl: `/auth/login` })
  }

  return (
    <>
      <Text>Hello2</Text>
      <Text testeroni>Hello2</Text>
      <hr />
      {user && <div>{JSON.stringify(user)}</div>}
      <button onClick={logout}>Sign out</button>
    </>
  )
}

export default Home
