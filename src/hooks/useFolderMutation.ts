import { useMutation, useQueryClient } from 'react-query'

import client, { handleApiError, type Mutation } from 'libs/api/client'
import { type FolderData } from 'libs/db/folder'
import { type AddFolderBody } from 'pages/api/folders'
import { type UpdateFolderBody } from 'pages/api/folders/[id]'
import useContentType, { type ContentType } from 'hooks/useContentType'
import { CONTENT_TREE_QUERY_KEY } from 'hooks/useContentTree'

export default function useFolderMutation() {
  const { type } = useContentType()
  const queryClient = useQueryClient()

  const mutation = useMutation<FolderData, unknown, FolderMutation>(
    (data) => {
      if (!type) {
        throw new Error(`Missing content type to ${data.mutationType} a folder.`)
      }

      switch (data.mutationType) {
        case 'add': {
          return addFolder({ name: data.name, parentId: data.parentId }, type)
        }
        case 'update': {
          return updateFolder({ id: data.id, name: data.name, parentId: data.parentId }, type)
        }
        default: {
          throw new Error('Unsupported folder mutation type.')
        }
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CONTENT_TREE_QUERY_KEY)
      },
    }
  )

  handleApiError(mutation)

  return mutation
}

function addFolder(data: AddFolderData, type: ContentType) {
  return client.post('folders', { json: { ...data, type } }).json<FolderData>()
}

function updateFolder({ id, ...data }: UpdateFolderData, type: ContentType) {
  return client.patch(`folders/${id}`, { json: { ...data, type } }).json<FolderData>()
}

type AddFolderData = Omit<AddFolderBody, 'type'>
type UpdateFolderData = Omit<UpdateFolderBody, 'type'> & { id: FolderData['id'] }

export type FolderMutation = Mutation<AddFolderData, 'add'> | Mutation<UpdateFolderData, 'update'>
