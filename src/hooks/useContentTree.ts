import { useQuery } from 'react-query'

import client from 'libs/api/client'
import { type NoteTreeData } from 'libs/db/tree'

export default function useContentTree() {
  const query = useQuery('todos', getNoteTree)

  return query
}

function getNoteTree() {
  return client.get('notes').json<NoteTreeData>()
}
