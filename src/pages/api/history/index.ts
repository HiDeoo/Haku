import { type NextApiRequest, type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { withAuth } from 'libs/api/routes/middlewares'
import { getHistory, type HistoryData } from 'libs/db/history'

const route = createApiRoute(
  {
    get: getHandler,
  },
  [withAuth]
)

export default route

async function getHandler(req: NextApiRequest, res: NextApiResponse<HistoryData>) {
  const { userId } = getApiRequestUser(req)

  const history = await getHistory(userId)

  return res.status(200).json(history)
}
