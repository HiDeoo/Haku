import { useQuery } from 'react-query'

import client from 'libs/api/client'
import { type FilesData } from 'libs/db/file'

export default function useFiles(enabled: boolean) {
  return useQuery<FilesData>('files', getFiles, { enabled })
}

function getFiles() {
  return client.get('files').json<FilesData>()
}
