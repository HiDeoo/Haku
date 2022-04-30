import { useMutation, useQueryClient } from 'react-query'

import { getInboxEntriesQueryKey } from 'hooks/useInboxEntriesQuery'
import { getClient } from 'libs/api/client'
import { type InboxEntryData } from 'libs/db/inbox'
import { type AddInboxEntryBody } from 'pages/api/inbox/share'

export function useInboxEntryMutation() {
  const queryClient = useQueryClient()

  return useMutation(addInboxEntry, {
    onSuccess: () => {
      // TODO(HiDeoo) Mutate the cache

      queryClient.invalidateQueries(getInboxEntriesQueryKey())
    },
  })
}

async function addInboxEntry({ text }: AddInboxEntryBody) {
  const body = new FormData()
  body.append('text', text)

  return (await getClient()).post('inbox/share', { body }).json<InboxEntryData>()
}
