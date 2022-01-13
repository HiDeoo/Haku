import ky from 'ky'
import { type DefaultOptions, type UseMutationResult, type UseQueryResult } from 'react-query'

import { is404, isNetworkError } from 'libs/http'

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

export type MutationType = 'add' | 'update' | 'remove'
export type Mutation<TData, TType extends MutationType> = TData & { mutationType: TType }
