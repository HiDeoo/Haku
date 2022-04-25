import { useQuery } from 'react-query'

import useContentType, { ContentType } from 'hooks/useContentType'
import { getClient, isNetworkError } from 'libs/api/client'
import { type NoteTreeData, type TodoTreeData } from 'libs/db/tree'

export default function useContentTreeQuery() {
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

async function getNoteTree() {
  return (await getClient()).get('notes').json<NoteTreeData>()
}

async function getTodoTree() {
  return (await getClient()).get('todos').json<TodoTreeData>()
}
