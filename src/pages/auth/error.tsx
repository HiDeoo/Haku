import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'

const errorMessages: Partial<Record<ErrorType, string>> = {
  AccessDenied: 'You do not have permission to login.',
  Verification: 'The login link is no longer valid.',
}

const Error: NextPage = () => {
  const { isReady, push, query } = useRouter()
  const { status } = useSession()

  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      push('/')
    }
  }, [push, status])

  useEffect(() => {
    if (isReady) {
      const authError: ErrorType = isErrorType(query.error) ? query.error : 'Default'

      setMessage(errorMessages[authError] ?? 'Something went wrong')
    }
  }, [isReady, query])

  function login() {
    signIn()
  }

  return (
    <>
      <div>Unable to login</div>
      <div>{message}</div>
      <button onClick={login}>Sign in</button>
    </>
  )
}

export default Error

function isErrorType(error: string | string[] | undefined): error is ErrorType {
  return typeof error === 'string' && erorTypes.includes(error as ErrorType)
}

const erorTypes = ['AccessDenied', 'Configuration', 'Default', 'Verification'] as const
type ErrorType = typeof erorTypes[number]
