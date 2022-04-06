import { setupServer } from 'msw/node'

import authHandlers from 'tests/api/mocks/auth'
import imageKitHandlers from 'tests/api/mocks/imageKit'

export { rest } from 'msw'

export const server = setupServer(...authHandlers, ...imageKitHandlers)

export function getTestApiUrl(apiRoute: string) {
  return `${process.env.NEXTAUTH_URL}/api/${apiRoute}`
}
