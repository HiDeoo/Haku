import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from 'react-query'

import useContentId from 'hooks/useContentId'
import { getContentTreeQueryKey } from 'hooks/useContentTreeQuery'
import useContentType, { ContentType } from 'hooks/useContentType'
import { getFilesQueryKey } from 'hooks/useFilesQuery'
import { getClient, type Mutation } from 'libs/api/client'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { type AddNoteBody } from 'pages/api/notes'
import { type RemoveNoteQuery, type UpdateNoteBody, type UpdateNoteQuery } from 'pages/api/notes/[id]'
import { type AddTodoBody } from 'pages/api/todos'
import { type RemoveTodoQuery } from 'pages/api/todos/[id]'

export default function useMetadataMutation() {
  const { push } = useRouter()
  const contentId = useContentId()
  const { lcType, type, urlPath } = useContentType()
  const queryClient = useQueryClient()

  return useMutation<NoteMetadata | TodoMetadata | void, unknown, MetadataMutation>(
    (data) => {
      if (!type) {
        throw new Error(`Missing content type to ${data.action} metadata.`)
      }

      switch (data.action) {
        case 'insert': {
          return type === ContentType.NOTE ? addNote(data) : addTodo(data)
        }
        case 'update': {
          const updateFn = type === ContentType.NOTE ? updateNote : updateTodo

          return updateFn({ id: data.id, name: data.name, folderId: data.folderId })
        }
        case 'delete': {
          const removeFn = type === ContentType.NOTE ? removeNote : removeTodo

          return removeFn({ id: data.id })
        }
        default: {
          throw new Error(`Unsupported ${lcType} metadata mutation type.`)
        }
      }
    },
    {
      onSuccess: (newMetadata, variables) => {
        queryClient.invalidateQueries(getContentTreeQueryKey(type))
        queryClient.invalidateQueries(getFilesQueryKey())

        if (
          newMetadata &&
          (variables.action === 'insert' || (variables.action === 'update' && variables.id === contentId))
        ) {
          push(`${urlPath}/${newMetadata.id}/${newMetadata.slug}`)
        } else if (variables.action === 'delete' && variables.id === contentId) {
          push(urlPath)
        }
      },
    }
  )
}

async function addNote(data: AddNoteBody) {
  return (await getClient()).post('notes', { json: data }).json<NoteMetadata>()
}

async function addTodo(data: AddTodoBody) {
  return (await getClient()).post('todos', { json: data }).json<TodoMetadata>()
}

async function updateNote({ id, ...data }: UpdateMetadata) {
  return (await getClient()).patch(`notes/${id}`, { json: data }).json<NoteMetadata>()
}

async function updateTodo({ id, ...data }: UpdateMetadata) {
  return (await getClient()).patch(`todos/${id}`, { json: data }).json<TodoMetadata>()
}

async function removeNote({ id }: RemoveNoteQuery) {
  await (await getClient()).delete(`notes/${id}`)
}

async function removeTodo({ id }: RemoveTodoQuery) {
  await (await getClient()).delete(`todos/${id}`)
}

type AddMetadata = AddNoteBody | AddTodoBody
type UpdateMetadata = Omit<UpdateNoteBody, 'type'> & UpdateNoteQuery
type RemoveMetadata = RemoveNoteQuery | RemoveTodoQuery

export type MetadataMutation =
  | Mutation<AddMetadata, 'insert'>
  | Mutation<UpdateMetadata, 'update'>
  | Mutation<RemoveMetadata, 'delete'>
