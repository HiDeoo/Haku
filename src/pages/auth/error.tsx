import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'

import { getAuthErrorMesssage } from 'libs/auth'
import Callout from 'components/Callout'
import Button from 'components/Button'

const Error: Page = () => {
  const { query } = useRouter()

  function login() {
    signIn()
  }

  return (
    <>
      <Callout intent="error" title="Unable to login" message={getAuthErrorMesssage(query.error)} />
      <Button primary onPress={login} className="mt-3">
        Try Again
      </Button>
    </>
  )
}

Error.sidebar = false

export default Error
