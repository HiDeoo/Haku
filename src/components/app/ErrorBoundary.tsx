import { ErrorBoundary as Boundary, type FallbackProps } from 'react-error-boundary'

import Button from 'components/form/Button'
import Callout from 'components/form/Callout'
import Flex from 'components/ui/Flex'
import Puzzle from 'components/ui/Puzzle'
import { openGitHubErrorReport } from 'libs/github'

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  return <Boundary FallbackComponent={Fallback}>{children}</Boundary>
}

export default ErrorBoundary

const Fallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  function reportAndTryAgain() {
    openGitHubErrorReport(error)

    resetErrorBoundary()
  }

  return (
    <Flex direction="col" alignItems="center">
      <Puzzle layout="broken" />
      <Callout intent="error" message="Oops, something went wrong!" />
      <div className="mt-3">
        <Button primary onPress={reportAndTryAgain}>
          Report & Try again
        </Button>
        <Button onPress={resetErrorBoundary}>Try again</Button>
      </div>
    </Flex>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}
