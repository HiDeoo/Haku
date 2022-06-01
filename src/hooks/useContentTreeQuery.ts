import useContentType, { ContentType } from 'hooks/useContentType'
import { isNetworkError, trpc } from 'libs/trpc'

export default function useContentTreeQuery() {
  const { type } = useContentType()

  return trpc.useQuery([getContentTreeQueryPath(type)], { useErrorBoundary: isNetworkError })
}

export function getContentTreeQueryPath(type?: ContentType) {
  return type === ContentType.NOTE ? 'note.list' : 'todo.list'
}
