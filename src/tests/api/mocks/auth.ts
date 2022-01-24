import { rest } from 'msw'

import { getTestApiUrl } from 'tests/api/mocks/http'

const handlers = [
  rest.get(getTestApiUrl('auth/session'), (_req, res, ctx) =>
    res(ctx.status(401), ctx.json({ error: 'Unauthorized', message: 'No test user provided.' }))
  ),
]

export default handlers
