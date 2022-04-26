import { useSetAtom } from 'jotai'
import { useQuery, type UseQueryOptions } from 'react-query'

import { contentAvailableOfflineAtom } from 'atoms/network'
import { SW_CACHES } from 'constants/sw'
import { getClient, isNetworkError } from 'libs/api/client'
import { type TodoMetadata } from 'libs/db/todo'
import { type TodoNodesData } from 'libs/db/todoNodes'
import { isResourceCached } from 'libs/sw'

export default function useTodoQuery(id: TodoMetadata['id'], options?: UseTodoQueryOptions) {
  const setContentAvailableOffline = useSetAtom(contentAvailableOfflineAtom)

  return useQuery<TodoNodesData>(
    ['todo', id],
    () => {
      if (!id) {
        throw new Error('Missing ID to fetch todo nodes.')
      }

      return getTodoNodes(id)
    },
    {
      onSettled: async () => {
        const isCached = await isResourceCached(SW_CACHES.Api, `/api/todos/${id}/nodes`)

        setContentAvailableOffline(isCached)
      },
      useErrorBoundary: isNetworkError,
      ...options,
    }
  )
}

async function getTodoNodes(id: TodoMetadata['id']) {
  return (await getClient()).get(`todos/${id}/nodes`).json<TodoNodesData>()
}

type UseTodoQueryOptions = Omit<UseQueryOptions<TodoNodesData>, 'onSettled' | 'useErrorBoundary'>
