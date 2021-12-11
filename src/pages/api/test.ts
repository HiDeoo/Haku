import type { NextApiRequest, NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { withAuth } from 'libs/api/routes/middlewares'

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
