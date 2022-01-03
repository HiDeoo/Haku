import { useQuery } from 'react-query'

import useContentType, { ContentType } from 'hooks/useContentType'
import client, { handleApiError } from 'libs/api/client'
import { type NoteTreeData, type TodoTreeData } from 'libs/db/tree'

export default function useContentTree() {
  const { type } = useContentType()

  const query = useQuery<NoteTreeData | TodoTreeData>('tree', () => {
    if (!type) {
      throw new Error('Missing content type to fetch the content tree.')
    }

    return type === ContentType.NOTE ? getNoteTree() : getTodoTree()
  })

  handleApiError(query, true)

  return query
}

function getNoteTree() {
  return client.get('notes').json<NoteTreeData>()
}

function getTodoTree() {
  return client.get('todos').json<TodoTreeData>()
}
