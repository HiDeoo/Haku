import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import Button from 'components/form/Button'
import Callout from 'components/form/Callout'
import Flex from 'components/ui/Flex'
import { getAuthErrorMesssage } from 'libs/auth'

const Error: Page = () => {
  const { pathname, push, query } = useRouter()

  useEffect(() => {
    // Being redirected to `/api/auth/error` without any specific error message (for example during development when
    // shutting down the server with the webpage still opened) would lead to the query string param `error` being the
    // `undefined` string. We can safely remove it.
    if (query.error === 'undefined') {
      push(pathname)
    }
  }, [pathname, push, query.error])

  return (
    <Flex direction="col" alignItems="center">
      <Callout intent="error" title="Unable to login" message={getAuthErrorMesssage(query.error)} className="mx-4" />
      <div className="mt-3">
        <Button primary onPress={handleTryAgainPress}>
          Try again
        </Button>
      </div>
    </Flex>
  )
}

Error.sidebar = false

export default Error

function handleTryAgainPress() {
  signIn(undefined, { callbackUrl: '/' })
}
