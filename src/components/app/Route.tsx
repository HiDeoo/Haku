import { useSetAtom } from 'jotai'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { contentTypeAtom } from 'atoms/contentType'
import Spinner from 'components/ui/Spinner'
import { ContentType } from 'constants/contentType'

const unsecureRoutes = new Set(['/auth/error', '/auth/login', '/auth/verify'])

const Route: React.FC<RouteProps> = ({ children }) => {
  const { push, query, route } = useRouter()
  const { status } = useSession()

  const setContentType = useSetAtom(contentTypeAtom)

  const isAuthenticated = status === 'authenticated'
  const isSecureRoute = !unsecureRoutes.has(route)

  const callbackUrl = typeof query.callbackUrl === 'string' ? query.callbackUrl : undefined

  useEffect(() => {
    if (status === 'loading') {
      return
    } else if (!isAuthenticated && isSecureRoute) {
      signIn()
    } else if (isAuthenticated && !isSecureRoute) {
      push(callbackUrl ?? '/')
    }
  }, [callbackUrl, isAuthenticated, isSecureRoute, push, status])

  useEffect(() => {
    const currentContentType = route.startsWith('/notes')
      ? ContentType.NOTE
      : route.startsWith('/todos')
      ? ContentType.TODO
      : undefined

    if (currentContentType) {
      setContentType(currentContentType)
    }
  }, [route, setContentType])

  if (status !== 'loading' && ((isAuthenticated && isSecureRoute) || (!isAuthenticated && !isSecureRoute))) {
    return <>{children}</>
  }

  return <Spinner delay className="h-10 w-10" />
}

export default Route

interface RouteProps {
  children: React.ReactNode
}
