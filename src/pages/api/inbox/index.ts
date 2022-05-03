import { type NextApiRequest, type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { getInboxEntries, type InboxEntryData, type InboxEntriesData, addInboxEntry } from 'libs/db/inbox'
import { z } from 'libs/validation'

const postBodySchema = z.object({
  text: z.string(),
})

const route = createApiRoute(
  {
    get: getHandler,
    post: withValidation(postHandler, postBodySchema),
  },
  [withAuth]
)

export default route

async function getHandler(req: NextApiRequest, res: NextApiResponse<InboxEntriesData>) {
  const { userId } = getApiRequestUser(req)

  const results = await getInboxEntries(userId)

  return res.status(200).json(results)
}

async function postHandler(
  req: ValidatedApiRequest<{ body: AddInboxEntryBody }>,
  res: NextApiResponse<InboxEntryData>
) {
  const { userId } = getApiRequestUser(req)

  const inboxEntry = await addInboxEntry(userId, req.body.text)

  return res.status(200).json(inboxEntry)
}

export type AddInboxEntryBody = z.infer<typeof postBodySchema>
