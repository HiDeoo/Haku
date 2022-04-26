import { useRouter } from 'next/router'

import Button from 'components/form/Button'
import Callout from 'components/form/Callout'
import Flex from 'components/ui/Flex'
import Puzzle from 'components/ui/Puzzle'

const ErrorPage: Page = () => {
  const { push } = useRouter()

  function goHome() {
    push('/')
  }

  return (
    <Flex direction="col" alignItems="center">
      <Puzzle layout="broken" />
      <Callout intent="error" message="Oops, something went wrong!" />
      <div className="mt-3">
        <Button primary onPress={goHome}>
          Back to Home
        </Button>
      </div>
    </Flex>
  )
}

ErrorPage.sidebar = false

export default ErrorPage
