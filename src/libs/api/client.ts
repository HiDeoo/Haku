import ky, { type HTTPError, type TimeoutError } from 'ky'

const client = ky.create({ prefixUrl: '/api', retry: 0 })

export default client

// FIXME(HiDeoo)
export type QueryError = HTTPError | TimeoutError
