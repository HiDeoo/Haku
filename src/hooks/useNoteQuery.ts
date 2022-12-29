import { useSetAtom } from 'jotai/react'
import { useEffect } from 'react'

import { contentAvailableOfflineAtom } from 'atoms/network'
import { SW_CACHES } from 'constants/sw'
import { type NoteData } from 'libs/db/note'
import { isResourceCached } from 'libs/sw'
import { isNetworkError, trpc } from 'libs/trpc'

export function useNoteQuery(id: NoteData['id'], options: UseNoteQueryOptions) {
  const setContentAvailableOffline = useSetAtom(contentAvailableOfflineAtom)

  const utils = trpc.useContext()
  const cancelTodoNodeById = utils.todo.node.byId.cancel

  useEffect(() => {
    if (!options.enabled) {
      cancelTodoNodeById()
    }
  }, [cancelTodoNodeById, options.enabled])

  return trpc.note.byId.useQuery(
    { id },
    {
      ...options,
      onSuccess: async () => {
        const isCached = await isResourceCached(SW_CACHES.Api, '/api/trpc/note.byId', { id })

        setContentAvailableOffline(isCached)
      },
      useErrorBoundary: isNetworkError,
    }
  )
}

interface UseNoteQueryOptions {
  enabled: boolean
}
