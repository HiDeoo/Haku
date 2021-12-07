import { type EmailAllowList } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import { ValidatedApiRequest, withAdmin, withValidation } from 'libs/middlewares'
import { addAllowedEmail, getAllowedEmails } from 'libs/db/emailAllowList'
import { createApiRoute } from 'libs/api'

const postSchema = z.object({
  email: z.string().email(),
})

const route = createApiRoute(
  {
    get: get,
    post: withValidation(post, postSchema),
  },
  [withAdmin]
)

export default route

async function get(_req: NextApiRequest, res: NextApiResponse<EmailAllowList[]>) {
  const emails = await getAllowedEmails()

  return res.status(200).json(emails)
}

async function post(req: ValidatedApiRequest<typeof postSchema>, res: NextApiResponse<EmailAllowList>) {
  const email = await addAllowedEmail(req.body.email)

  return res.status(200).json(email)
}
