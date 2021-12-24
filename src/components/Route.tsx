import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import Spinner from 'components/Spinner'

const unsecureRoutes = ['/auth/error', '/auth/login', '/auth/verify']

const Route: React.FC = ({ children }) => {
  const { push, route } = useRouter()
  const { status } = useSession()

  const isAuthenticated = status === 'authenticated'
  const isSecureRoute = !unsecureRoutes.includes(route)

  useEffect(() => {
    if (status === 'loading') {
      return
    } else if (!isAuthenticated && isSecureRoute) {
      signIn()
    } else if (isAuthenticated && !isSecureRoute) {
      push('/')
    }
  }, [isAuthenticated, isSecureRoute, push, status])

  if (status !== 'loading' && ((isAuthenticated && isSecureRoute) || (!isAuthenticated && !isSecureRoute))) {
    return <>{children}</>
  }

  return <Spinner delay className="h-10 w-10" />
}

export default Route
