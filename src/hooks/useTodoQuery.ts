import { useSetAtom } from 'jotai'

import { contentAvailableOfflineAtom } from 'atoms/network'
import { SW_CACHES } from 'constants/sw'
import { type TodoMetadata } from 'libs/db/todo'
import { type TodoNodesData } from 'libs/db/todoNodes'
import { isResourceCached } from 'libs/sw'
import { isNetworkError, trpc } from 'libs/trpc'

export default function useTodoQuery(id: TodoMetadata['id'], options: UseTodoQueryOptions) {
  const setContentAvailableOffline = useSetAtom(contentAvailableOfflineAtom)

  return trpc.useQuery(['todo.node.byId', { id }], {
    ...options,
    onSettled: async () => {
      const isCached = await isResourceCached(SW_CACHES.Api, '/api/trpc/todo.node.byId', { id })

      setContentAvailableOffline(isCached)
    },
    useErrorBoundary: isNetworkError,
  })
}

interface UseTodoQueryOptions {
  enabled: boolean
  onSuccess?: (todoNodes: TodoNodesData) => void
}
