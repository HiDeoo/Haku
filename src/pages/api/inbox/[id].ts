import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { removeInboxEntry } from 'libs/db/inbox'
import { z, zQuerySchemaWithId } from 'libs/validation'

const route = createApiRoute(
  {
    delete: withValidation(deleteHandler, undefined, zQuerySchemaWithId),
  },
  [withAuth]
)

export default route

async function deleteHandler(req: ValidatedApiRequest<{ query: RemoveInboxEntryQuery }>, res: NextApiResponse<void>) {
  const { userId } = getApiRequestUser(req)

  await removeInboxEntry(userId, req.query.id)

  return res.status(200).end()
}

export type RemoveInboxEntryQuery = z.infer<typeof zQuerySchemaWithId>
