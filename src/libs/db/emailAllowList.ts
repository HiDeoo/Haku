import { EmailAllowList } from '@prisma/client'

import { prisma } from 'libs/db'

export function getAllowedEmails(): Promise<EmailAllowList[]> {
  return prisma.emailAllowList.findMany()
}
