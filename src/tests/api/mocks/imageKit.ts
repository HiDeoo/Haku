import { rest } from 'msw'

import { IMAGE_KIT_UPLOAD_URL } from 'libs/imageKit'

const handlers = [
  // TODO(HiDeoo)
  rest.post(IMAGE_KIT_UPLOAD_URL, (_req, res, ctx) => res(ctx.status(200), ctx.json({ test: 'prout' }))),
]

export default handlers
