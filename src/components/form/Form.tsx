import { HTTPError } from 'ky'
import { useEffect, useState } from 'react'

import Callout from 'components/form/Callout'
import { type ApiErrorResponse } from 'libs/api/routes/errors'

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
    async function getErrorMessage() {
      let msg = errorMessage ?? 'Something went wrong!'

      if (error instanceof HTTPError) {
        try {
          const json = await error.response.clone().json()

          if (isApiErrorResponse(json)) {
            msg = json.error
          }
        } catch (e) {
          // We do not care about parsing related errors.
        }
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

function isApiErrorResponse(json: unknown): json is ApiErrorResponse {
  return typeof json === 'object' && typeof (json as Record<string, unknown>).error === 'string'
}

interface FormProps {
  children: React.ReactNode
  className?: string
  error?: unknown
  errorMessage?: string
  onSubmit: NonNullable<React.DOMAttributes<HTMLFormElement>['onSubmit']>
}
