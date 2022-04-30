import { useQuery } from 'react-query'

import { getClient, isNetworkError } from 'libs/api/client'
import { type InboxEntriesData } from 'libs/db/inbox'

export default function useInboxEntriesQuery() {
  return useQuery<InboxEntriesData>(getInboxEntriesQueryKey(), getInboxEntries, { useErrorBoundary: isNetworkError })
}

export function getInboxEntriesQueryKey() {
  return ['inbox']
}

async function getInboxEntries() {
  return (await getClient()).get('inbox').json<InboxEntriesData>()
}
