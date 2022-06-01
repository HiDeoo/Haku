import { setupServer } from 'msw/node'

import cloudinaryHandlers from 'tests/api/mocks/cloudinary'

export { rest } from 'msw'

export const server = setupServer(...cloudinaryHandlers)
