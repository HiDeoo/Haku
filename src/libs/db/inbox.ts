import { type InboxEntry, Prisma } from '@prisma/client'

import { ApiError, API_ERROR_INBOX_ENTRY_DOES_NOT_EXIST } from 'libs/api/routes/errors'
import { prisma } from 'libs/db'

export type InboxEntryData = Prisma.InboxEntryGetPayload<{ select: typeof inboxEntryDataSelect }>
export type InboxEntriesData = InboxEntryData[]

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

export function getInboxEntries(userId: UserId): Promise<InboxEntriesData> {
  return prisma.inboxEntry.findMany({
    where: { userId },
    select: inboxEntryDataSelect,
    orderBy: [{ createdAt: 'desc' }],
  })
}

export function removeInboxEntry(userId: UserId, id: InboxEntry['id']) {
  return prisma.$transaction(async (prisma) => {
    const inboxEntry = await getInboxEntryById(userId, id)

    if (!inboxEntry) {
      throw new ApiError(API_ERROR_INBOX_ENTRY_DOES_NOT_EXIST)
    }

    return prisma.inboxEntry.delete({ where: { id } })
  })
}

function getInboxEntryById(userId: UserId, id: InboxEntry['id']): Promise<InboxEntry | null> {
  return prisma.inboxEntry.findFirst({ where: { id, userId } })
}
