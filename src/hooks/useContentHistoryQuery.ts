import { useQuery } from 'react-query'

import { getClient, isNetworkError } from 'libs/api/client'
import { type HistoryData } from 'libs/db/history'

export default function useContentHistoryQuery() {
  return useQuery<HistoryData>(['history'], getHistory, { useErrorBoundary: isNetworkError })
}

async function getHistory() {
  return (await getClient()).get('history').json<HistoryData>()
}
