import { setupServer } from 'msw/node'

import authHandlers from 'tests/api/mocks/auth'

export { rest } from 'msw'

export const server = setupServer(...authHandlers)

export function getTestApiUrl(apiRoute: string) {
  return `${process.env.NEXTAUTH_URL}/api/${apiRoute}`
}
