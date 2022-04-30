import cuid from 'cuid'
import { useMutation, useQueryClient } from 'react-query'

import { getInboxEntriesQueryKey } from 'hooks/useInboxEntriesQuery'
import { getClient } from 'libs/api/client'
import { type InboxEntriesData, type InboxEntryData } from 'libs/db/inbox'
import { type AddInboxEntryBody } from 'pages/api/inbox/share'

export function useInboxEntryMutation() {
  const queryClient = useQueryClient()

  return useMutation(addInboxEntry, {
    onError: (_error, _variables, context?: { previousInboxEntries?: InboxEntriesData }) => {
      if (context?.previousInboxEntries) {
        queryClient.setQueryData<InboxEntriesData>(getInboxEntriesQueryKey(), context.previousInboxEntries)
      }
    },
    onMutate: async (newInboxEntry) => {
      const queryKey = getInboxEntriesQueryKey()

      await queryClient.cancelQueries(queryKey)

      const previousInboxEntries = queryClient.getQueryData<InboxEntriesData>(queryKey)

      queryClient.setQueryData<InboxEntriesData>(queryKey, (prevInboxEntries) => [
        { ...newInboxEntry, createdAt: new Date(), id: cuid() },
        ...(prevInboxEntries ?? []),
      ])

      return { previousInboxEntries }
    },
    onSettled: () => {
      queryClient.invalidateQueries(getInboxEntriesQueryKey())
    },
  })
}

async function addInboxEntry({ text }: AddInboxEntryBody) {
  const body = new FormData()
  body.append('text', text)

  return (await getClient()).post('inbox/share', { body }).json<InboxEntryData>()
}
