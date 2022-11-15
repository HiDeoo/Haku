import cuid from 'cuid'

import { type InboxEntriesData } from 'libs/db/inbox'
import { trpc } from 'libs/trpc'

export function useInboxEntryMutation() {
  const utils = trpc.useContext()

  const {
    error: errorAdd,
    isLoading: isLoadingAdd,
    mutate: mutateAdd,
    mutateAsync: mutateAddAsync,
  } = trpc.inbox.add.useMutation({
    onError: (_error, _variables, context) => {
      if (isInboxEntryContext(context) && context.oldInboxEntries) {
        utils.inbox.list.setData(undefined, context.oldInboxEntries)
      }
    },
    onMutate: async (newInboxEntry) => {
      utils.inbox.list.cancel()

      const oldInboxEntries = utils.inbox.list.getData()

      utils.inbox.list.setData(undefined, (prevInboxEntries) => [
        { ...newInboxEntry, createdAt: new Date(), id: cuid() },
        ...(prevInboxEntries ?? []),
      ])

      return { oldInboxEntries }
    },
    onSettled: () => {
      utils.inbox.list.invalidate()
    },
  })

  const {
    error: errorDelete,
    isLoading: isLoadingDelete,
    mutate: mutateDelete,
  } = trpc.inbox.delete.useMutation({
    onError: (_error, _variables, context) => {
      if (isInboxEntryContext(context) && context.oldInboxEntries) {
        utils.inbox.list.setData(undefined, context.oldInboxEntries)
      }
    },
    onMutate: async (newInboxEntry) => {
      utils.inbox.list.cancel()

      const oldInboxEntries = utils.inbox.list.getData()

      utils.inbox.list.setData(
        undefined,
        (prevInboxEntries) => prevInboxEntries?.filter((entry) => entry.id !== newInboxEntry.id) ?? []
      )

      return { oldInboxEntries }
    },
    onSettled: () => {
      utils.inbox.list.invalidate()
    },
  })

  return {
    error: errorAdd || errorDelete,
    isLoading: isLoadingAdd || isLoadingDelete,
    mutateAdd,
    mutateAddAsync,
    mutateDelete,
  }
}

function isInboxEntryContext(context: unknown): context is InboxEntryContext {
  return typeof context === 'object' && typeof (context as InboxEntryContext).oldInboxEntries !== 'undefined'
}

interface InboxEntryContext {
  oldInboxEntries?: InboxEntriesData
}
