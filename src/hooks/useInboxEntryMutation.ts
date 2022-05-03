import cuid from 'cuid'
import { useMutation, useQueryClient } from 'react-query'

import { getInboxEntriesQueryKey } from 'hooks/useInboxEntriesQuery'
import { getClient, Mutation } from 'libs/api/client'
import { type InboxEntriesData, type InboxEntryData } from 'libs/db/inbox'
import { type AddInboxEntryBody } from 'pages/api/inbox'
import { type RemoveInboxEntryQuery } from 'pages/api/inbox/[id]'

export function useInboxEntryMutation() {
  const queryClient = useQueryClient()

  return useMutation<InboxEntryData | void, unknown, InboxEntryMutation, InboxEntryContext>(
    (data) => {
      switch (data.action) {
        case 'insert': {
          return addInboxEntry({ text: data.text })
        }
        case 'delete': {
          return removeInboxEntry({ id: data.id })
        }
        default: {
          throw new Error(`Unsupported inbox entry mutation type.`)
        }
      }
    },
    {
      onError: (_error, _variables, context) => {
        if (context?.oldInboxEntries) {
          queryClient.setQueryData<InboxEntriesData>(getInboxEntriesQueryKey(), context.oldInboxEntries)
        }
      },
      onMutate: async (newInboxEntry) => {
        const queryKey = getInboxEntriesQueryKey()

        await queryClient.cancelQueries(queryKey)

        const oldInboxEntries = queryClient.getQueryData<InboxEntriesData>(queryKey)

        if (newInboxEntry.action === 'insert') {
          queryClient.setQueryData<InboxEntriesData>(queryKey, (prevInboxEntries) => [
            { ...newInboxEntry, createdAt: new Date(), id: cuid() },
            ...(prevInboxEntries ?? []),
          ])
        } else if (newInboxEntry.action === 'delete') {
          queryClient.setQueryData<InboxEntriesData>(
            queryKey,
            (prevInboxEntries) => prevInboxEntries?.filter((entry) => entry.id !== newInboxEntry.id) ?? []
          )
        }

        return { oldInboxEntries }
      },
      onSettled: () => {
        queryClient.invalidateQueries(getInboxEntriesQueryKey())
      },
    }
  )
}

async function addInboxEntry(data: AddInboxEntryBody) {
  return (await getClient()).post('inbox', { json: data }).json<InboxEntryData>()
}

async function removeInboxEntry({ id }: RemoveInboxEntryQuery) {
  await (await getClient()).delete(`inbox/${id}`)
}

type InboxEntryMutation = Mutation<AddInboxEntryBody, 'insert'> | Mutation<RemoveInboxEntryQuery, 'delete'>

interface InboxEntryContext {
  oldInboxEntries?: InboxEntriesData
}
