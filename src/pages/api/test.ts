import type { NextApiRequest, NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api'
import { withAuth } from 'libs/api/middlewares'

const route = createApiRoute(
  {
    get: getHandler,
  },
  [withAuth]
)

export default route

async function getHandler(req: NextApiRequest, res: NextApiResponse<string>) {
  const { id } = getApiRequestUser(req)

  return res.status(200).json(id)
}
