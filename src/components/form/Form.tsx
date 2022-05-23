import { TRPCClientError } from '@trpc/react'
import { useEffect, useState } from 'react'

import Callout from 'components/form/Callout'

const Form: React.FC<FormProps> = ({ children, className, error, errorMessage, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className={className}>
      {error || errorMessage ? <FormError error={error} errorMessage={errorMessage} /> : null}
      {children}
    </form>
  )
}

export default Form

const FormError: React.FC<Omit<FormProps, 'onSubmit' | 'children'>> = ({ error, errorMessage }) => {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    function getErrorMessage() {
      let msg = errorMessage ?? 'Something went wrong!'

      if (error instanceof TRPCClientError) {
        msg = error.message
      }

      setMessage(msg)
    }

    getErrorMessage()
  }, [error, errorMessage])

  if (!message) {
    return null
  }

  return <Callout intent="error" message={message} />
}

interface FormProps {
  children: React.ReactNode
  className?: string
  error?: unknown
  errorMessage?: string
  onSubmit: NonNullable<React.DOMAttributes<HTMLFormElement>['onSubmit']>
}
