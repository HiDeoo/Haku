import type { NextApiResponse } from 'next'

import { createApiRoute } from 'libs/api/routes'
import { type ValidatedApiRequest, withAdmin, withValidation } from 'libs/api/routes/middlewares'
import { z, zStringAsNumber } from 'libs/validation'
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
