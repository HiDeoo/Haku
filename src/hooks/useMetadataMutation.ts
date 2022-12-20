import { useRouter } from 'next/router'
import { useCallback } from 'react'

import { useContentId } from 'hooks/useContentId'
import { useContentTreeUtils } from 'hooks/useContentTreeUtils'
import { ContentType, useContentType } from 'hooks/useContentType'
import { trpc } from 'libs/trpc'

export function useMetadataMutation() {
  const { push, replace } = useRouter()
  const { contentId } = useContentId()
  const { type, urlPath } = useContentType()
  const contentTreeUtils = useContentTreeUtils()
  const utils = trpc.useContext()

  const procedurePath = type === ContentType.NOTE ? trpc.note : trpc.todo

  const {
    error: errorAdd,
    isLoading: isLoadingAdd,
    mutate: mutateAdd,
    reset: resetAdd,
  } = procedurePath.add.useMutation({
    onSuccess: async (newMetadata) => {
      await contentTreeUtils.invalidate()
      await utils.file.list.invalidate()
      await utils.history.invalidate()

      push(`${urlPath}/${newMetadata.id}/${newMetadata.slug}`)
    },
  })

  const {
    error: errorDelete,
    isLoading: isLoadingDelete,
    mutate: mutateDelete,
    reset: resetDelete,
  } = procedurePath.delete.useMutation({
    onSuccess: async (_newMetadata, variables) => {
      await contentTreeUtils.invalidate()
      await utils.file.list.invalidate()
      await utils.history.invalidate()

      if (variables.id === contentId) {
        replace(urlPath, undefined, { shallow: true })
      }
    },
  })

  const {
    error: errorUpdate,
    isLoading: isLoadingUpdate,
    mutate: mutateUpdate,
    reset: resetUpdate,
  } = procedurePath.update.useMutation({
    onSuccess: async (newMetadata, variables) => {
      await contentTreeUtils.invalidate()
      await utils.file.list.invalidate()
      await utils.history.invalidate()

      if (variables.id === contentId) {
        if (type === ContentType.NOTE) {
          utils.note.byId.setData({ id: variables.id }, (prevNote) => {
            if (!prevNote) {
              return
            }

            return {
              ...prevNote,
              name: newMetadata.name,
            }
          })
        } else {
          utils.todo.node.byId.setData({ id: variables.id }, (prevTodoNodes) => {
            if (!prevTodoNodes) {
              return
            }

            return {
              ...prevTodoNodes,
              name: newMetadata.name,
            }
          })
        }

        replace(`${urlPath}/${newMetadata.id}/${newMetadata.slug}`, undefined, { shallow: true })
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
