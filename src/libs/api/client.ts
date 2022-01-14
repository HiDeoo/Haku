import ky, { HTTPError, TimeoutError } from 'ky'
import { type DefaultOptions, type UseMutationResult, type UseQueryResult } from 'react-query'

const client = ky.create({ prefixUrl: '/api', retry: 0 })

export default client

export function getQueryClientDefaultOptions(): DefaultOptions {
  return {
    queries: {
      retry(failureCount: number, error: unknown) {
        if (is404(error)) {
          return false
        }

        return failureCount < 3
      },
    },
  }
}

export function handleApiError<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  { error }: UseQueryResult<TData, TError> | UseMutationResult<TData, TError, TVariables, TContext>,
  throwOnNetworkError = false
) {
  if (!error) {
    return
  }

  if (!throwOnNetworkError && isNetworkError(error)) {
    return
  }

  throw error
}

function isNetworkError(error: unknown) {
  return (
    error instanceof HTTPError ||
    error instanceof TimeoutError ||
    (error instanceof TypeError && error.message === 'Failed to fetch')
  )
}

function is404(error: unknown) {
  return error instanceof HTTPError && error.response.status === 404
}

export type MutationType = 'add' | 'update' | 'remove'
export type Mutation<TData, TType extends MutationType> = TData & { mutationType: TType }
