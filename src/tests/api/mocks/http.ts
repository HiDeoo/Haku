import { setupServer } from 'msw/node'

import authHandlers from 'tests/api/mocks/auth'
import cloudinaryHandlers from 'tests/api/mocks/cloudinary'

export { rest } from 'msw'

export const server = setupServer(...authHandlers, ...cloudinaryHandlers)

export function getTestApiUrl(apiRoute: string) {
  return `${process.env.NEXTAUTH_URL}/api/${apiRoute}`
}
