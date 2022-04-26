import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from 'react-query'

import { getContentTreeQueryKey } from 'hooks/useContentTreeQuery'
import useContentType, { type ContentType } from 'hooks/useContentType'
import { getClient, type Mutation } from 'libs/api/client'
import { type FolderData } from 'libs/db/folder'
import { type AddFolderBody } from 'pages/api/folders'
import { type UpdateFolderQuery, type UpdateFolderBody, type RemoveFolderQuery } from 'pages/api/folders/[id]'

export default function useFolderMutation() {
  const { push } = useRouter()
  const { type, urlPath } = useContentType()
  const queryClient = useQueryClient()

  return useMutation<FolderData | void, unknown, FolderMutation>(
    (data) => {
      if (!type) {
        throw new Error(`Missing content type to ${data.action} a folder.`)
      }

      switch (data.action) {
        case 'insert': {
          return addFolder({ name: data.name, parentId: data.parentId }, type)
        }
        case 'update': {
          return updateFolder({ id: data.id, name: data.name, parentId: data.parentId }, type)
        }
        case 'delete': {
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

        if (variables.action === 'delete') {
          push(urlPath)
        }
      },
    }
  )
}

async function addFolder(data: AddFolderData, type: ContentType) {
  return (await getClient()).post('folders', { json: { ...data, type } }).json<FolderData>()
}

async function updateFolder({ id, ...data }: UpdateFolderData, type: ContentType) {
  return (await getClient()).patch(`folders/${id}`, { json: { ...data, type } }).json<FolderData>()
}

async function removeFolder({ id }: RemoveFolderData) {
  await (await getClient()).delete(`folders/${id}`)
}

type AddFolderData = Omit<AddFolderBody, 'type'>
type UpdateFolderData = Omit<UpdateFolderBody, 'type'> & UpdateFolderQuery
type RemoveFolderData = RemoveFolderQuery

export type FolderMutation =
  | Mutation<AddFolderData, 'insert'>
  | Mutation<UpdateFolderData, 'update'>
  | Mutation<RemoveFolderData, 'delete'>
