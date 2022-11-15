import { type InboxEntry, Prisma } from '@prisma/client'

import { API_ERROR_INBOX_ENTRY_DOES_NOT_EXIST } from 'constants/error'
import { handleDbError, prisma } from 'libs/db'

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

export async function removeInboxEntry(userId: UserId, id: InboxEntry['id']) {
  try {
    return await prisma.inboxEntry.delete({ where: { id, userId } })
  } catch (error) {
    handleDbError(error, {
      delete: API_ERROR_INBOX_ENTRY_DOES_NOT_EXIST,
    })
  }
}
