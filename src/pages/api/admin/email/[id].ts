import type { NextApiResponse } from 'next'

import { createApiRoute } from 'libs/api'
import { ValidatedApiRequest, withAdmin, withValidation } from 'libs/middlewares'
import { z, zStringAsNumber } from 'utils/validation'
import { removeAllowedEmail } from 'libs/db/emailAllowList'

const deleteSchema = z.object({
  id: zStringAsNumber,
})

const route = createApiRoute(
  {
    delete: withValidation(deleteHandler, undefined, deleteSchema),
  },
  [withAdmin]
)

export default route

async function deleteHandler(req: ValidatedApiRequest<{ query: typeof deleteSchema }>, res: NextApiResponse<void>) {
  await removeAllowedEmail(req.query.id)

  return res.status(200).end()
}
