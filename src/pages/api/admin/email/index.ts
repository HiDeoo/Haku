import { type EmailAllowList } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

import { withAdmin } from 'libs/middlewares'
import { getAllowedEmails } from 'libs/db/emailAllowList'
import { createApiRoute } from 'libs/api'

const route = createApiRoute({ get }, [withAdmin])

export default route

async function get(_req: NextApiRequest, res: NextApiResponse<EmailAllowList[]>) {
  const emails = await getAllowedEmails()

  res.status(200).json(emails)
}
