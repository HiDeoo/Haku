import { useQuery } from 'react-query'

import client, { handleApiError } from 'libs/api/client'
import { type NoteTreeData } from 'libs/db/tree'

export default function useContentTree() {
  const query = useQuery<NoteTreeData>('tree', getNoteTree)

  handleApiError(query, true)

  return query
}

function getNoteTree() {
  return client.get('notes').json<NoteTreeData>()
}
