import { ErrorBoundary as Boundary, type FallbackProps } from 'react-error-boundary'

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  return <Boundary FallbackComponent={Fallback}>{children}</Boundary>
}

export default ErrorBoundary

// TODO(HiDeoo)
const Fallback: React.FC<FallbackProps> = ({ resetErrorBoundary }) => {
  return (
    <div>
      FALL BACK
      <div>
        <button onClick={resetErrorBoundary}>RESET</button>
      </div>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}
