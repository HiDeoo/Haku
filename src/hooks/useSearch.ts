import { type SearchParamsOption } from 'ky'
import { useInfiniteQuery } from 'react-query'

import { SEARCH_QUERY_MIN_LENGTH, SEARCH_RESULT_LIMIT } from 'constants/search'
import client from 'libs/api/client'
import { type SearchResulstData } from 'libs/db/file'

export default function useSearch(enabled: boolean, query?: string) {
  const sanitizedQuery = query ? query.trim() : ''

  return useInfiniteQuery(['search', query], ({ pageParam }) => getSearchResults(sanitizedQuery, pageParam), {
    enabled: enabled && sanitizedQuery.length >= SEARCH_QUERY_MIN_LENGTH,
    getNextPageParam: (lastPage, pages) => (lastPage.length === SEARCH_RESULT_LIMIT ? pages.length : undefined),
  })
}

function getSearchResults(query: string, page?: number) {
  const searchParams: SearchParamsOption = { q: query }

  if (page) {
    searchParams.page = page
  }

  return client.get(`search`, { searchParams }).json<SearchResulstData>()
}
