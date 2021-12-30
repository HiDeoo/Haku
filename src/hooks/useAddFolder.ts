import { useMutation } from 'react-query'

import client, { handleApiError } from 'libs/api/client'
import { type FolderData } from 'libs/db/folder'
import { type AddFolderBody } from 'pages/api/folders'
import useContentType, { type ContentType } from 'hooks/useContentType'

export default function useAddFolder() {
  const type = useContentType()

  const mutation = useMutation<FolderData, unknown, AddFolderData>((data) => {
    if (!type) {
      throw new Error('Missing content type to add a folder.')
    }

    return addFolder(data, type)
  })

  handleApiError(mutation)

  return mutation
}

function addFolder(data: AddFolderData, type: ContentType) {
  return client.post('folders', { json: { ...data, type } }).json<FolderData>()
}

type AddFolderData = Omit<AddFolderBody, 'type'>