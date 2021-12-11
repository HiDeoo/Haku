import { type EmailAllowList } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

import { ValidatedApiRequest, withAdmin, withValidation } from 'libs/api/routes/middlewares'
import { addAllowedEmail, getAllowedEmails } from 'libs/db/emailAllowList'
import { createApiRoute } from 'libs/api/routes'
import { z, zEmail } from 'libs/validation'

const postSchema = z.object({
  email: zEmail,
})

const route = createApiRoute(
  {
    get: getHandler,
    post: withValidation(postHandler, postSchema),
  },
  [withAdmin]
)

export default route

async function getHandler(_req: NextApiRequest, res: NextApiResponse<EmailAllowList[]>) {
  const emails = await getAllowedEmails()

  return res.status(200).json(emails)
}

async function postHandler(
  req: ValidatedApiRequest<{ body: typeof postSchema }>,
  res: NextApiResponse<EmailAllowList>
) {
  const email = await addAllowedEmail(req.body.email)

  return res.status(200).json(email)
}
