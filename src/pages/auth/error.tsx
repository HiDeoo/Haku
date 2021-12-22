import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'

import { getAuthErrorMesssage } from 'libs/auth'

const Error: Page = () => {
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

Error.sidebar = false

export default Error
