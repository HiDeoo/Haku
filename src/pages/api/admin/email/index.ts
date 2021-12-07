import { type EmailAllowList } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

import withAdmin from 'middlewares/withAdmin'
import { getAllowedEmails } from 'libs/db/emailAllowList'

async function handler(_req: NextApiRequest, res: NextApiResponse<EmailAllowList[]>) {
  const emails = await getAllowedEmails()

  res.status(200).json(emails)
}

export default withAdmin(handler)
