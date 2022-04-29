import { useMutation } from 'react-query'

import { getClient } from 'libs/api/client'
import { type InboxEntryData } from 'libs/db/inbox'
import { type AddInboxEntryBody } from 'pages/api/inbox/share'

export function useInboxEntryMutation() {
  return useMutation(addInboxEntry)
}

async function addInboxEntry({ text }: AddInboxEntryBody) {
  const body = new FormData()
  body.append('text', text)

  return (await getClient()).post('inbox/share', { body }).json<InboxEntryData>()
}
