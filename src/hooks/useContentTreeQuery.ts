import { ContentType, useContentType } from 'hooks/useContentType'
import { isNetworkError, trpc } from 'libs/trpc'

export function useContentTreeQuery() {
  const { type } = useContentType()

  const procedurePath = type === ContentType.NOTE ? trpc.note.list : trpc.todo.list

  return procedurePath.useQuery(undefined, { useErrorBoundary: isNetworkError })
}
