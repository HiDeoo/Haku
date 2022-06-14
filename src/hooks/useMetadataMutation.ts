import { useRouter } from 'next/router'
import { useCallback } from 'react'

import useContentId from 'hooks/useContentId'
import { getContentTreeQueryPath } from 'hooks/useContentTreeQuery'
import useContentType, { ContentType } from 'hooks/useContentType'
import { trpc } from 'libs/trpc'

export default function useMetadataMutation() {
  const { push } = useRouter()
  const { contentId } = useContentId()
  const { type, urlPath } = useContentType()

  const { invalidateQueries } = trpc.useContext()

  const {
    error: errorAdd,
    isLoading: isLoadingAdd,
    mutate: mutateAdd,
    reset: resetAdd,
  } = trpc.useMutation([type === ContentType.NOTE ? 'note.add' : 'todo.add'], {
    onSuccess: (newMetadata) => {
      invalidateQueries([getContentTreeQueryPath(type)])
      invalidateQueries(['file.list'])
      invalidateQueries(['history'])

      push(`${urlPath}/${newMetadata.id}/${newMetadata.slug}`)
    },
  })

  const {
    error: errorDelete,
    isLoading: isLoadingDelete,
    mutate: mutateDelete,
    reset: resetDelete,
  } = trpc.useMutation([type === ContentType.NOTE ? 'note.delete' : 'todo.delete'], {
    onSuccess: (_newMetadata, variables) => {
      invalidateQueries([getContentTreeQueryPath(type)])
      invalidateQueries(['file.list'])
      invalidateQueries(['history'])

      if (variables.id === contentId) {
        push(urlPath)
      }
    },
  })

  const {
    error: errorUpdate,
    isLoading: isLoadingUpdate,
    mutate: mutateUpdate,
    reset: resetUpdate,
  } = trpc.useMutation([type === ContentType.NOTE ? 'note.update' : 'todo.update'], {
    onSuccess: (newMetadata, variables) => {
      invalidateQueries([getContentTreeQueryPath(type)])
      invalidateQueries(['file.list'])
      invalidateQueries(['history'])

      if (variables.id === contentId) {
        push(`${urlPath}/${newMetadata.id}/${newMetadata.slug}`)
      }
    },
  })

  const reset = useCallback(() => {
    resetAdd()
    resetDelete()
    resetUpdate()
  }, [resetAdd, resetDelete, resetUpdate])

  return {
    error: errorAdd || errorDelete || errorUpdate,
    isLoading: isLoadingAdd || isLoadingDelete || isLoadingUpdate,
    mutateAdd,
    mutateDelete,
    mutateUpdate,
    reset,
  }
}
