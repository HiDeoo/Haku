import { useQuery } from 'react-query'

import useContentType, { ContentType } from 'hooks/useContentType'
import client, { isNetworkError } from 'libs/api/client'
import { type NoteTreeData, type TodoTreeData } from 'libs/db/tree'

export default function useContentTree() {
  const { type } = useContentType()

  return useQuery<NoteTreeData | TodoTreeData>(
    getContentTreeQueryKey(type),
    () => {
      if (!type) {
        throw new Error('Missing content type to fetch the content tree.')
      }

      return type === ContentType.NOTE ? getNoteTree() : getTodoTree()
    },
    { useErrorBoundary: isNetworkError }
  )
}

export function getContentTreeQueryKey(type?: ContentType) {
  return ['content-tree', type]
}

function getNoteTree() {
  return client.get('notes').json<NoteTreeData>()
}

function getTodoTree() {
  return client.get('todos').json<TodoTreeData>()
}
