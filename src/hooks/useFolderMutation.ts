import { useRouter } from 'next/router'
import { useCallback } from 'react'

import { getContentTreeQueryPath } from 'hooks/useContentTreeQuery'
import { ContentType, useContentType } from 'hooks/useContentType'
import { trpc } from 'libs/trpc'

export function useFolderMutation() {
  const { push } = useRouter()
  const { type, urlPath } = useContentType()
  const { invalidateQueries } = trpc.useContext()

  const {
    error: errorAdd,
    isLoading: isLoadingAdd,
    mutate: mutateAdd,
    reset: resetAdd,
  } = trpc.useMutation(['folder.add'], {
    onSuccess: () => {
      invalidateQueries([getContentTreeQueryPath(type)])
    },
  })

  const {
    error: errorDelete,
    isLoading: isLoadingDelete,
    mutate: mutateDelete,
    reset: resetDelete,
  } = trpc.useMutation(['folder.delete'], {
    onSuccess: () => {
      invalidateQueries([getContentTreeQueryPath(type)])

      push(urlPath)
    },
  })

  const {
    error: errorUpdate,
    isLoading: isLoadingUpdate,
    mutate: mutateUpdate,
    reset: resetUpdate,
  } = trpc.useMutation(['folder.update'], {
    onSuccess: () => {
      invalidateQueries([getContentTreeQueryPath(type)])
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
    type: type ?? ContentType.NOTE,
  }
}
