import ky, { HTTPError, TimeoutError } from 'ky'
import { type DefaultOptions } from 'react-query'

const client = ky.create({ prefixUrl: '/api', retry: 0 })

export default client

export function getQueryClientDefaultOptions(): DefaultOptions {
  return {
    queries: {
      retry(failureCount: number, error: unknown) {
        if (isClientNotFoundError(error)) {
          return false
        }

        return failureCount < 3
      },
    },
  }
}

export function isNetworkError(error: unknown) {
  return (
    error instanceof HTTPError ||
    error instanceof TimeoutError ||
    (error instanceof TypeError && error.message === 'Failed to fetch')
  )
}

function isClientNotFoundError(error: unknown) {
  return error instanceof HTTPError && error.response.status === 404
}

export type MutationType = 'add' | 'update' | 'remove'
export type Mutation<TData, TType extends MutationType> = TData & { mutationType: TType }
