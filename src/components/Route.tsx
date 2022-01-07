import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import Spinner from 'components/Spinner'
import { useStore, type StoreState } from 'stores'
import { ContentType } from 'stores/contentType'

const unsecureRoutes = ['/auth/error', '/auth/login', '/auth/verify']

const contentTypeStoreSelector = (state: StoreState) => [state.contentType, state.setContentType] as const

const Route: React.FC = ({ children }) => {
  const { push, route } = useRouter()
  const { status } = useSession()

  const [contentType, setContentType] = useStore(contentTypeStoreSelector)

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
