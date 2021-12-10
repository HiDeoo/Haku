import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const Auth: React.FC<Props> = ({ children, secure }) => {
  const { push } = useRouter()
  const { status } = useSession()

  const isAuthenticated = status === 'authenticated'

  useEffect(() => {
    if (status === 'loading') {
      return
    } else if (!isAuthenticated && secure) {
      signIn()
    } else if (isAuthenticated && !secure) {
      push('/')
    }
  }, [isAuthenticated, push, secure, status])

  if (status !== 'loading' && ((isAuthenticated && secure) || (!isAuthenticated && !secure))) {
    return <>{children}</>
  }

  return <div>Loading…</div>
}

export default Auth

interface Props {
  secure: boolean
}
