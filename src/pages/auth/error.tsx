import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'

import Button from 'components/form/Button'
import Callout from 'components/form/Callout'
import Flex from 'components/ui/Flex'
import { getAuthErrorMesssage } from 'libs/auth'

const Error: Page = () => {
  const { query } = useRouter()

  function login() {
    signIn(undefined, { callbackUrl: '/' })
  }

  return (
    <Flex direction="col" alignItems="center">
      <Callout intent="error" title="Unable to login" message={getAuthErrorMesssage(query.error)} className="mx-4" />
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
