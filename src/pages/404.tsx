import { useRouter } from 'next/router'

import Button from 'components/form/Button'
import Callout from 'components/form/Callout'
import Flex from 'components/ui/Flex'
import Puzzle from 'components/ui/Puzzle'

const PageNotFound: Page = () => {
  const { push } = useRouter()

  function goHome() {
    push('/')
  }

  return (
    <Flex direction="col" alignItems="center">
      <Puzzle layout="incomplete" />
      <Callout intent="error" message="Oops, something is missing!" />
      <div className="mt-3">
        <Button primary onPress={goHome}>
          Back to Home
        </Button>
      </div>
    </Flex>
  )
}

PageNotFound.sidebar = false

export default PageNotFound
