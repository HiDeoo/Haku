import { type InboxEntry, Prisma } from '@prisma/client'

import { prisma } from 'libs/db'

export type InboxEntryData = Prisma.InboxEntryGetPayload<{ select: typeof inboxEntryDataSelect }>

const inboxEntryDataSelect = Prisma.validator<Prisma.InboxEntrySelect>()({
  id: true,
  createdAt: true,
  text: true,
})

export function addInboxEntry(userId: UserId, text: InboxEntry['text']): Promise<InboxEntryData> {
  return prisma.inboxEntry.create({
    data: { userId, text },
    select: inboxEntryDataSelect,
  })
}

export function getInboxEntries(userId: UserId): Promise<InboxEntryData[]> {
  return prisma.inboxEntry.findMany({
    where: { userId },
    select: inboxEntryDataSelect,
    orderBy: [{ createdAt: 'desc' }],
  })
}
