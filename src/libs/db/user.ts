import { type User } from '@prisma/client'

import { prisma } from 'libs/db'

export function getUserByInboxToken(inboxToken: User['inboxToken']): Promise<User | null> {
  return prisma.user.findFirst({ where: { inboxToken } })
}
