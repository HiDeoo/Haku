import { useSetAtom } from 'jotai/react'
import { useEffect } from 'react'

import { contentAvailableOfflineAtom } from 'atoms/network'
import { SW_CACHES } from 'constants/sw'
import { type TodoMetadata } from 'libs/db/todo'
import { type TodoNodesData } from 'libs/db/todoNodes'
import { isResourceCached } from 'libs/sw'
import { isNetworkError, trpc } from 'libs/trpc'

export function useTodoQuery(id: TodoMetadata['id'], options: UseTodoQueryOptions) {
  const setContentAvailableOffline = useSetAtom(contentAvailableOfflineAtom)

  const utils = trpc.useContext()
  const cancelTodoNodeById = utils.todo.node.byId.cancel

  useEffect(() => {
    if (!options.enabled) {
      cancelTodoNodeById()
    }
  }, [cancelTodoNodeById, options.enabled])

  return trpc.todo.node.byId.useQuery(
    { id },
    {
      ...options,
      onSettled: async () => {
        const isCached = await isResourceCached(SW_CACHES.Api, '/api/trpc/todo.node.byId', { id })

        setContentAvailableOffline(isCached)
      },
      useErrorBoundary: isNetworkError,
    }
  )
}

interface UseTodoQueryOptions {
  enabled: boolean
  onSuccess?: (todoNodes: TodoNodesData) => void
}
