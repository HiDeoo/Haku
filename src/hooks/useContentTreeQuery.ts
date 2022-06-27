import { ContentType, useContentType } from 'hooks/useContentType'
import { isNetworkError, trpc } from 'libs/trpc'

export function useContentTreeQuery() {
  const { type } = useContentType()

  return trpc.useQuery([getContentTreeQueryPath(type)], { useErrorBoundary: isNetworkError })
}

export function getContentTreeQueryPath(type?: ContentType) {
  return type === ContentType.NOTE ? 'note.list' : 'todo.list'
}
