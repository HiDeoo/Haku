import { HTTPError } from 'ky'
import { useEffect, useState } from 'react'

import Callout from 'components/Callout'
import { type ApiErrorResponse } from 'libs/api/routes/errors'

const Form: React.FC<Props> = ({ children, error, onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <FormError error={error} />
      {children}
    </form>
  )
}

export default Form

const FormError: React.FC<Pick<Props, 'error'>> = ({ error }) => {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function getErrorMessage() {
      let errorMessage = 'Something went wrong!'

      if (error instanceof HTTPError) {
        try {
          const json = await error.response.clone().json()

          if (isApiErrorResponse(json)) {
            errorMessage = json.error
          }
        } catch (e) {
          // We do not care about parsing related errors.
        }
      }

      setMessage(errorMessage)
    }

    getErrorMessage()
  }, [error])

  if (!error || !message) {
    return null
  }

  return <Callout intent="error" message={message} />
}

function isApiErrorResponse(json: unknown): json is ApiErrorResponse {
  return typeof json === 'object' && typeof (json as Record<string, unknown>).error === 'string'
}

interface Props {
  error?: unknown
  onSubmit: NonNullable<React.DOMAttributes<HTMLFormElement>['onSubmit']>
}
