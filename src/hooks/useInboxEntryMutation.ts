import cuid from 'cuid'

import { type InboxEntriesData } from 'libs/db/inbox'
import { trpc } from 'libs/trpc'

export function useInboxEntryMutation() {
  const { cancelQuery, getQueryData, invalidateQueries, setQueryData } = trpc.useContext()

  const {
    error: errorAdd,
    isLoading: isLoadingAdd,
    mutate: mutateAdd,
    mutateAsync: mutateAddAsync,
  } = trpc.useMutation(['inbox.add'], {
    onError: (_error, _variables, context) => {
      if (isInboxEntryContext(context) && context.oldInboxEntries) {
        setQueryData(['inbox.list'], context.oldInboxEntries)
      }
    },
    onMutate: async (newInboxEntry) => {
      await cancelQuery(['inbox.list'])

      const oldInboxEntries = getQueryData(['inbox.list'])

      setQueryData(['inbox.list'], (prevInboxEntries: InboxEntriesData) => [
        { ...newInboxEntry, createdAt: new Date(), id: cuid() },
        ...(prevInboxEntries ?? []),
      ])

      return { oldInboxEntries }
    },
    onSettled: () => {
      invalidateQueries(['inbox.list'])
    },
  })

  const {
    error: errorDelete,
    isLoading: isLoadingDelete,
    mutate: mutateDelete,
  } = trpc.useMutation(['inbox.delete'], {
    onError: (_error, _variables, context) => {
      if (isInboxEntryContext(context) && context.oldInboxEntries) {
        setQueryData(['inbox.list'], context.oldInboxEntries)
      }
    },
    onMutate: async (newInboxEntry) => {
      await cancelQuery(['inbox.list'])

      const oldInboxEntries = getQueryData(['inbox.list'])

      setQueryData(
        ['inbox.list'],
        (prevInboxEntries: InboxEntriesData) => prevInboxEntries?.filter((entry) => entry.id !== newInboxEntry.id) ?? []
      )

      return { oldInboxEntries }
    },
    onSettled: () => {
      invalidateQueries(['inbox.list'])
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
