import { type NextApiResponse, type PageConfig } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import {
  withAuthOrInboxToken,
  withFormDataValidation,
  type ValidatedApiFormDataRequest,
} from 'libs/api/routes/middlewares'
import { addInboxEntry, InboxEntryData } from 'libs/db/inbox'
import { z } from 'libs/validation'

const postBodySchema = z.object({
  text: z.string(),
  token: z.string().optional(),
})

const route = createApiRoute({
  post: withFormDataValidation(withAuthOrInboxToken(postHandler), { bodySchema: postBodySchema }),
})

export default route

async function postHandler(
  req: ValidatedApiFormDataRequest<{ body: AddInboxEntryBody }>,
  res: NextApiResponse<InboxEntryData>
) {
  const { userId } = getApiRequestUser(req)

  const inboxEntry = await addInboxEntry(userId, req.body.text)

  return res.status(200).json(inboxEntry)
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

export type AddInboxEntryBody = z.infer<typeof postBodySchema>
