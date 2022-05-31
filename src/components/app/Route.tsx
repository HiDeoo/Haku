import { useAtom } from 'jotai'
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

  const [contentType, setContentType] = useAtom(contentTypeAtom)

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
    let currentContentType: ContentType | undefined = undefined

    if (route.startsWith('/notes')) {
      currentContentType = ContentType.NOTE
    } else if (route.startsWith('/todos')) {
      currentContentType = ContentType.TODO
    }

    if (currentContentType && contentType !== currentContentType) {
      setContentType(currentContentType)
    }
  }, [contentType, route, setContentType])

  if (status !== 'loading' && ((isAuthenticated && isSecureRoute) || (!isAuthenticated && !isSecureRoute))) {
    return <>{children}</>
  }

  return <Spinner delay className="h-10 w-10" />
}

export default Route

interface RouteProps {
  children: React.ReactNode
}
