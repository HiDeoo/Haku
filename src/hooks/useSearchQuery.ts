import { SEARCH_QUERY_MIN_LENGTH, SEARCH_RESULT_LIMIT } from 'constants/search'
import { trpc } from 'libs/trpc'

export default function useSearchQuery(enabled: boolean, query?: string) {
  const sanitizedQuery = query ? query.trim() : ''

  return trpc.useInfiniteQuery(['search', { q: sanitizedQuery }], {
    enabled: enabled && sanitizedQuery.length >= SEARCH_QUERY_MIN_LENGTH,
    getNextPageParam: (lastPage, pages) => (lastPage.length === SEARCH_RESULT_LIMIT ? pages.length : undefined),
  })
}
