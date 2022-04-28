import { type NextApiResponse } from 'next'

import { IMAGE_MAX_SIZE_IN_MEGABYTES } from 'constants/image'
import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import {
  imageFileFilter,
  type ValidatedApiFormDataRequest,
  withAuth,
  withFormDataValidation,
} from 'libs/api/routes/middlewares'
import { type ImageData, uploadToCloudinary } from 'libs/cloudinary'
import { getBytesFromMegaBytes } from 'libs/math'
import { z } from 'libs/validation'

const postBodySchema = z.object({
  referenceId: z.string().cuid(),
})

const route = createApiRoute(
  {
    post: withFormDataValidation(postHandler, {
      maxFileSizeInBytes: getBytesFromMegaBytes(IMAGE_MAX_SIZE_IN_MEGABYTES),
      fileFilter: imageFileFilter,
      bodySchema: postBodySchema,
    }),
  },
  [withAuth]
)

export default route

async function postHandler(
  req: ValidatedApiFormDataRequest<{ body: AddImageBody; file: true }>,
  res: NextApiResponse<ImageData>
) {
  const { userId } = getApiRequestUser(req)

  const image = await uploadToCloudinary(userId, req.file, req.body.referenceId)

  return res.status(200).json(image)
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export type AddImageBody = z.infer<typeof postBodySchema>
