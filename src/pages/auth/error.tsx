import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'

import { getAuthErrorMesssage } from 'libs/auth'
import Callout from 'components/Callout'
import Button from 'components/Button'
import Flex from 'components/Flex'

const Error: Page = () => {
  const { query } = useRouter()

  function login() {
    signIn()
  }

  return (
    <Flex direction="col" alignItems="center">
      <Callout intent="error" title="Unable to login" message={getAuthErrorMesssage(query.error)} />
      <div>
        <Button primary onPress={login} className="mt-3">
          Try Again
        </Button>
      </div>
    </Flex>
  )
}

Error.sidebar = false

export default Error
