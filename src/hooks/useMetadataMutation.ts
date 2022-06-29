import { useRouter } from 'next/router'
import { useCallback } from 'react'

import { useContentId } from 'hooks/useContentId'
import { getContentTreeQueryPath } from 'hooks/useContentTreeQuery'
import { ContentType, useContentType } from 'hooks/useContentType'
import { type NoteData } from 'libs/db/note'
import { type TodoNodesData } from 'libs/db/todoNodes'
import { trpc } from 'libs/trpc'

export function useMetadataMutation() {
  const { push, replace } = useRouter()
  const { contentId } = useContentId()
  const { type, urlPath } = useContentType()

  const { invalidateQueries, setQueryData } = trpc.useContext()

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
        replace(urlPath, undefined, { shallow: true })
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
        if (type === ContentType.NOTE) {
          setQueryData(['note.byId', { id: variables.id }], (prevNote: NoteData) => ({
            ...prevNote,
            name: newMetadata.name,
          }))
        } else {
          setQueryData(['todo.node.byId', { id: variables.id }], (prevTodoNodes: TodoNodesData) => ({
            ...prevTodoNodes,
            name: newMetadata.name,
          }))
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
