import { type NextApiRequest, type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { withAuth } from 'libs/api/routes/middlewares'
import { getInboxEntries, type InboxEntryData } from 'libs/db/inbox'

const route = createApiRoute(
  {
    get: getHandler,
  },
  [withAuth]
)

export default route

async function getHandler(req: NextApiRequest, res: NextApiResponse<InboxEntryData[]>) {
  const { userId } = getApiRequestUser(req)

  const results = await getInboxEntries(userId)

  return res.status(200).json(results)
}
