import { useSetAtom } from 'jotai'
import { useQuery, type UseQueryOptions } from 'react-query'

import { contentAvailableOfflineAtom } from 'atoms/network'
import { SW_CACHES } from 'constants/sw'
import client, { isNetworkError } from 'libs/api/client'
import { type NoteData } from 'libs/db/note'
import { isResourceCached } from 'libs/sw'

export default function useNoteQuery(id: NoteData['id'], options?: UseNoteQueryOptions) {
  const setContentAvailableOffline = useSetAtom(contentAvailableOfflineAtom)

  return useQuery<NoteData>(
    ['note', id],
    () => {
      if (!id) {
        throw new Error('Missing ID to fetch a note.')
      }

      return getNote(id)
    },
    {
      onSettled: async () => {
        const isCached = await isResourceCached(SW_CACHES.Api, `/api/notes/${id}`)

        setContentAvailableOffline(isCached)
      },
      useErrorBoundary: isNetworkError,
      ...options,
    }
  )
}

function getNote(id: NoteData['id']) {
  return client.get(`notes/${id}`).json<NoteData>()
}

type UseNoteQueryOptions = Omit<UseQueryOptions<NoteData>, 'onSettled' | 'useErrorBoundary'>
