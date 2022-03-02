import { useQuery, type UseQueryOptions } from 'react-query'

import client, { isNetworkError } from 'libs/api/client'
import { type TodoMetadata } from 'libs/db/todo'
import { type TodoNodesData } from 'libs/db/todoNodes'

export default function useTodoQuery(id: TodoMetadata['id'], options?: UseQueryOptions<TodoNodesData>) {
  return useQuery<TodoNodesData>(
    ['todo', id],
    () => {
      if (!id) {
        throw new Error('Missing ID to fetch todo nodes.')
      }

      return getTodoNodes(id)
    },
    { useErrorBoundary: isNetworkError, ...options }
  )
}

function getTodoNodes(id: TodoMetadata['id']) {
  return client.get(`todos/${id}/nodes`).json<TodoNodesData>()
}
