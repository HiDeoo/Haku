import { HTTPError, TimeoutError } from 'ky'

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export function isNetworkError(error: unknown) {
  return (
    error instanceof HTTPError ||
    error instanceof TimeoutError ||
    (error instanceof TypeError && error.message === 'Failed to fetch')
  )
}

export function is404(error: unknown) {
  return error instanceof HTTPError && error.response.status === 404
}
