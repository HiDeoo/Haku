import { ContentType, useContentType } from 'hooks/useContentType'
import { isNetworkError, trpc } from 'libs/trpc'

export function useContentTreeQuery() {
  const { type } = useContentType()

  return type === ContentType.NOTE
    ? trpc.note.list.useQuery(undefined, { useErrorBoundary: isNetworkError })
    : trpc.todo.list.useQuery(undefined, { useErrorBoundary: isNetworkError })
}
