import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'

import { getAuthErrorMesssage } from 'libs/auth'

const Error: NextPage = () => {
  const { query } = useRouter()

  function login() {
    signIn()
  }

  return (
    <>
      <div>Unable to login</div>
      <div>{getAuthErrorMesssage(query.error)}</div>
      <button onClick={login}>Sign in</button>
    </>
  )
}

export default Error
