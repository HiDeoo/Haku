import { useQuery, type UseQueryOptions } from 'react-query'

import client, { handleApiError } from 'libs/api/client'
import { type NoteData } from 'libs/db/note'

export default function useNote(id?: NoteData['id'], options?: UseQueryOptions<NoteData>) {
  const query = useQuery<NoteData>(
    ['note', id],
    () => {
      if (!id) {
        throw new Error('Missing ID to fetch a note.')
      }

      return getNote(id)
    },
    options
  )

  handleApiError(query, true)

  return query
}

function getNote(id: NoteData['id']) {
  return client.get(`notes/${id}`).json<NoteData>()
}
