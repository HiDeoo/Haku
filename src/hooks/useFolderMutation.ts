import { useRouter } from 'next/router'
import { useCallback } from 'react'

import { useContentTreeUtils } from 'hooks/useContentTreeUtils'
import { ContentType, useContentType } from 'hooks/useContentType'
import { trpc } from 'libs/trpc'

export function useFolderMutation() {
  const { push } = useRouter()
  const { type, urlPath } = useContentType()
  const contentTreeUtils = useContentTreeUtils()

  const {
    error: errorAdd,
    isLoading: isLoadingAdd,
    mutate: mutateAdd,
    reset: resetAdd,
  } = trpc.folder.add.useMutation({
    onSuccess: async () => {
      await contentTreeUtils.invalidate()
    },
  })

  const {
    error: errorDelete,
    isLoading: isLoadingDelete,
    mutate: mutateDelete,
    reset: resetDelete,
  } = trpc.folder.delete.useMutation({
    onSuccess: async () => {
      await contentTreeUtils.invalidate()

      push(urlPath)
    },
  })

  const {
    error: errorUpdate,
    isLoading: isLoadingUpdate,
    mutate: mutateUpdate,
    reset: resetUpdate,
  } = trpc.folder.update.useMutation({
    onSuccess: async () => {
      await contentTreeUtils.invalidate()
    },
  })

  const reset = useCallback(() => {
    resetAdd()
    resetDelete()
    resetUpdate()
  }, [resetAdd, resetDelete, resetUpdate])

  return {
    error: errorAdd ?? errorDelete ?? errorUpdate,
    isLoading: isLoadingAdd || isLoadingDelete || isLoadingUpdate,
    mutateAdd,
    mutateDelete,
    mutateUpdate,
    reset,
    type: type ?? ContentType.NOTE,
  }
}
