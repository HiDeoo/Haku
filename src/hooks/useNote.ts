import { useQuery, type UseQueryOptions } from 'react-query'

import client, { isNetworkError } from 'libs/api/client'
import { type NoteData } from 'libs/db/note'

export default function useNote(id: NoteData['id'], options?: UseQueryOptions<NoteData>) {
  return useQuery<NoteData>(
    ['note', id],
    () => {
      if (!id) {
        throw new Error('Missing ID to fetch a note.')
      }

      return getNote(id)
    },
    { useErrorBoundary: isNetworkError, ...options }
  )
}

function getNote(id: NoteData['id']) {
  return client.get(`notes/${id}`).json<NoteData>()
}
