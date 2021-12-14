import type { NextApiRequest, NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { withAuth } from 'libs/api/routes/middlewares'
import { getNoteTree, type NoteTree } from 'libs/db/tree'

const route = createApiRoute(
  {
    get: getHandler,
  },
  [withAuth]
)

export default route

async function getHandler(req: NextApiRequest, res: NextApiResponse<NoteTree>) {
  const { userId } = getApiRequestUser(req)
  const content = await getNoteTree(userId)

  console.log('content ', JSON.stringify(content, null, '\t'))

  return res.status(200).json(content)
}
