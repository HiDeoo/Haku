import { type NextApiRequest, type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { withAuth } from 'libs/api/routes/middlewares'
import { type FilesData, getFiles } from 'libs/db/file'

const route = createApiRoute(
  {
    get: getHandler,
  },
  [withAuth]
)

export default route

async function getHandler(req: NextApiRequest, res: NextApiResponse<FilesData>) {
  const { userId } = getApiRequestUser(req)

  const files = await getFiles(userId)

  return res.status(200).json(files)
}
