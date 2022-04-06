import { type NextApiResponse } from 'next'

import { IMAGE_MAX_SIZE_IN_MEGABYTES } from 'constants/image'
import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type FileApiRequest, withAuth, withFile, imageFileFilter } from 'libs/api/routes/middlewares'
import { uploadToImageKit } from 'libs/imageKit'
import { getBytesFromMegaBytes } from 'libs/math'

const route = createApiRoute(
  {
    post: withFile(postHandler, getBytesFromMegaBytes(IMAGE_MAX_SIZE_IN_MEGABYTES), imageFileFilter),
  },
  [withAuth]
)

export default route

async function postHandler(req: FileApiRequest, res: NextApiResponse<object>) {
  const { userId } = getApiRequestUser(req)

  await uploadToImageKit(userId, req.file)

  return res.status(200).json({})
}

export const config = {
  api: {
    bodyParser: false,
  },
}
