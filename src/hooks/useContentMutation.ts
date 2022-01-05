import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from 'react-query'

import client, { handleApiError, type Mutation } from 'libs/api/client'
import { type AddNoteBody } from 'pages/api/notes'
import { type AddTodoBody } from 'pages/api/todos'
import { type NoteMetaData } from 'libs/db/note'
import useContentType, { ContentType } from 'hooks/useContentType'
import { CONTENT_TREE_QUERY_KEY } from 'hooks/useContentTree'
import { type TodoMetaData } from 'libs/db/todo'
import { type RemoveNoteQuery, type UpdateNoteBody, type UpdateNoteQuery } from 'pages/api/notes/[id]'
import { type RemoveTodoQuery } from 'pages/api/todos/[id]'

export default function useContentMutation() {
  const { push, query } = useRouter()
  const { hrType, type, urlPath } = useContentType()
  const queryClient = useQueryClient()

  const mutation = useMutation<NoteMetaData | TodoMetaData | void, unknown, ContentMutation>(
    (data) => {
      if (!type) {
        throw new Error(`Missing content type to ${data.mutationType} content.`)
      }

      switch (data.mutationType) {
        case 'add': {
          return type === ContentType.NOTE ? addNote(data) : addTodo(data)
        }
        case 'update': {
          const updateFn = type === ContentType.NOTE ? updateNote : updateTodo

          return updateFn({ id: data.id, name: data.name, folderId: data.folderId })
        }
        case 'remove': {
          const removeFn = type === ContentType.NOTE ? removeNote : removeTodo

          return removeFn({ id: data.id })
        }
        default: {
          throw new Error(`Unsupported ${hrType} mutation type.`)
        }
      }
    },
    {
      onSuccess: (newContentData, variables) => {
        queryClient.invalidateQueries(CONTENT_TREE_QUERY_KEY)

        const currentContentId = typeof query.id === 'string' ? parseInt(query.id, 10) : undefined

        if (
          newContentData &&
          (variables.mutationType === 'add' ||
            (variables.mutationType === 'update' && variables.id === currentContentId))
        ) {
          push(`${urlPath}/${newContentData.id}/${newContentData.slug}`)
        } else if (variables.mutationType === 'remove' && variables.id === currentContentId && urlPath) {
          push(urlPath)
        }
      },
    }
  )

  handleApiError(mutation)

  return mutation
}

function addNote(data: AddNoteBody) {
  return client.post('notes', { json: data }).json<NoteMetaData>()
}

function addTodo(data: AddTodoBody) {
  return client.post('todos', { json: data }).json<TodoMetaData>()
}

function updateNote({ id, ...data }: UpdateContentData) {
  return client.patch(`notes/${id}`, { json: data }).json<NoteMetaData>()
}

function updateTodo({ id, ...data }: UpdateContentData) {
  return client.patch(`todos/${id}`, { json: data }).json<TodoMetaData>()
}

async function removeNote({ id }: RemoveNoteQuery) {
  await client.delete(`notes/${id}`)
}

async function removeTodo({ id }: RemoveTodoQuery) {
  await client.delete(`todos/${id}`)
}

type AddContentData = AddNoteBody | AddTodoBody
type UpdateContentData = Omit<UpdateNoteBody, 'type'> & UpdateNoteQuery
type RemoveContentData = RemoveNoteQuery | RemoveTodoQuery

export type ContentMutation =
  | Mutation<AddContentData, 'add'>
  | Mutation<UpdateContentData, 'update'>
  | Mutation<RemoveContentData, 'remove'>
