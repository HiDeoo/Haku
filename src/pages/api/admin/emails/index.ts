import { type EmailAllowList } from '@prisma/client'
import { type NextApiRequest, type NextApiResponse } from 'next'

import { createApiRoute } from 'libs/api/routes'
import { type ValidatedApiRequest, withAdmin, withValidation } from 'libs/api/routes/middlewares'
import { addAllowedEmail, getAllowedEmails } from 'libs/db/emailAllowList'
import { z, zEmail } from 'libs/validation'

const postBodySchema = z.object({
  email: zEmail,
})

const route = createApiRoute(
  {
    get: getHandler,
    post: withValidation(postHandler, postBodySchema),
  },
  [withAdmin]
)

export default route

async function getHandler(_req: NextApiRequest, res: NextApiResponse<EmailAllowList[]>) {
  const emails = await getAllowedEmails()

  return res.status(200).json(emails)
}

async function postHandler(
  req: ValidatedApiRequest<{ body: AddAllowedEmailBody }>,
  res: NextApiResponse<EmailAllowList>
) {
  const email = await addAllowedEmail(req.body.email)

  return res.status(200).json(email)
}

type AddAllowedEmailBody = z.infer<typeof postBodySchema>
