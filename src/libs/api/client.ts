import ky, { HTTPError, TimeoutError } from 'ky'
import { type UseMutationResult, type UseQueryResult } from 'react-query'

const client = ky.create({ prefixUrl: '/api', retry: 0 })

export default client

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

type MutationType = 'add' | 'update' | 'remove'
export type Mutation<Data, Type extends MutationType> = Data & { mutationType: Type }
