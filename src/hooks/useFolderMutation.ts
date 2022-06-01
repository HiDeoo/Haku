import { useRouter } from 'next/router'

import { getContentTreeQueryPath } from 'hooks/useContentTreeQuery'
import useContentType, { ContentType } from 'hooks/useContentType'
import { trpc } from 'libs/trpc'

export default function useFolderMutation() {
  const { push } = useRouter()
  const { type, urlPath } = useContentType()
  const { invalidateQueries } = trpc.useContext()

  const {
    error: errorAdd,
    isLoading: isLoadingAdd,
    mutate: mutateAdd,
  } = trpc.useMutation(['folder.add'], {
    onSuccess: () => {
      invalidateQueries([getContentTreeQueryPath(type)])
    },
  })

  const {
    error: errorDelete,
    isLoading: isLoadingDelete,
    mutate: mutateDelete,
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
  } = trpc.useMutation(['folder.update'], {
    onSuccess: () => {
      invalidateQueries([getContentTreeQueryPath(type)])
    },
  })

  return {
    error: errorAdd || errorDelete || errorUpdate,
    isLoading: isLoadingAdd || isLoadingDelete || isLoadingUpdate,
    mutateAdd,
    mutateDelete,
    mutateUpdate,
    type: type ?? ContentType.NOTE,
  }
}
