import { useQuery } from 'react-query'

import client from 'libs/api/client'
import { type FilesData } from 'libs/db/file'

export default function useFilesQuery(enabled: boolean) {
  return useQuery<FilesData>('files', getFiles, { enabled })
}

export function getFilesQueryKey() {
  return 'files'
}

function getFiles() {
  return client.get('files').json<FilesData>()
}
