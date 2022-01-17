import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from 'react-query'

import client, { type Mutation } from 'libs/api/client'
import { type FolderData } from 'libs/db/folder'
import { type AddFolderBody } from 'pages/api/folders'
import { type UpdateFolderQuery, type UpdateFolderBody, type RemoveFolderQuery } from 'pages/api/folders/[id]'
import useContentType, { type ContentType } from 'hooks/useContentType'
import { getContentTreeQueryKey } from 'hooks/useContentTree'

export default function useFolderMutation() {
  const { push } = useRouter()
  const { type, urlPath } = useContentType()
  const queryClient = useQueryClient()

  return useMutation<FolderData | void, unknown, FolderMutation>(
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
        case 'remove': {
          return removeFolder({ id: data.id })
        }
        default: {
          throw new Error('Unsupported folder mutation type.')
        }
      }
    },
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(getContentTreeQueryKey(type))

        if (variables.mutationType === 'remove') {
          push(urlPath)
        }
      },
    }
  )
}

function addFolder(data: AddFolderData, type: ContentType) {
  return client.post('folders', { json: { ...data, type } }).json<FolderData>()
}

function updateFolder({ id, ...data }: UpdateFolderData, type: ContentType) {
  return client.patch(`folders/${id}`, { json: { ...data, type } }).json<FolderData>()
}

async function removeFolder({ id }: RemoveFolderData) {
  await client.delete(`folders/${id}`)
}

type AddFolderData = Omit<AddFolderBody, 'type'>
type UpdateFolderData = Omit<UpdateFolderBody, 'type'> & UpdateFolderQuery
type RemoveFolderData = RemoveFolderQuery

export type FolderMutation =
  | Mutation<AddFolderData, 'add'>
  | Mutation<UpdateFolderData, 'update'>
  | Mutation<RemoveFolderData, 'remove'>
