import { type EmailAllowList } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import { ValidatedApiRequest, withAdmin, withValidation } from 'libs/middlewares'
import { addAllowedEmail, getAllowedEmails, removeAllowedEmail } from 'libs/db/emailAllowList'
import { createApiRoute } from 'libs/api'

const postSchema = z.object({
  email: z.string().email(),
})

const deleteSchema = z.object({
  id: z.number(),
})

const route = createApiRoute(
  {
    get: getHandler,
    post: withValidation(postHandler, postSchema),
    delete: withValidation(deleteHandler, deleteSchema),
  },
  [withAdmin]
)

export default route

async function getHandler(_req: NextApiRequest, res: NextApiResponse<EmailAllowList[]>) {
  const emails = await getAllowedEmails()

  return res.status(200).json(emails)
}

async function postHandler(req: ValidatedApiRequest<typeof postSchema>, res: NextApiResponse<EmailAllowList>) {
  const email = await addAllowedEmail(req.body.email)

  return res.status(200).json(email)
}

async function deleteHandler(req: ValidatedApiRequest<typeof deleteSchema>, res: NextApiResponse<void>) {
  await removeAllowedEmail(req.body.id)

  return res.status(200).end()
}
