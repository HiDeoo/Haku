import { type NextApiResponse } from 'next'

import { IMAGE_MAX_SIZE_IN_MEGABYTES } from 'constants/image'
import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type FileApiRequest, withAuth, withFile } from 'libs/api/routes/middlewares'

const route = createApiRoute(
  {
    post: withFile(postHandler, IMAGE_MAX_SIZE_IN_MEGABYTES * 1024 * 1024),
  },
  [withAuth]
)

export default route

async function postHandler(req: FileApiRequest, res: NextApiResponse<object>) {
  const { userId } = getApiRequestUser(req)

  console.log('🚨 [index.ts:20] userId', userId)
  console.log('🚨 [index.ts:21] req.file', req.file)

  return res.status(200).json({})
}

export const config = {
  api: {
    bodyParser: false,
  },
}
