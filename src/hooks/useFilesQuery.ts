import { useQuery } from 'react-query'

import { getClient } from 'libs/api/client'
import { type FilesData } from 'libs/db/file'

export default function useFilesQuery(enabled: boolean) {
  return useQuery<FilesData>(getFilesQueryKey(), getFiles, { enabled })
}

export function getFilesQueryKey() {
  return ['files']
}

async function getFiles() {
  return (await getClient()).get('files').json<FilesData>()
}
