import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from 'react-query'

import client, { handleApiError, type Mutation } from 'libs/api/client'
import { type AddNoteBody } from 'pages/api/notes'
import { type AddTodoBody } from 'pages/api/todos'
import { type NoteMetaData } from 'libs/db/note'
import useContentType, { ContentType } from 'hooks/useContentType'
import { CONTENT_TREE_QUERY_KEY } from 'hooks/useContentTree'
import { type TodoMetaData } from 'libs/db/todo'
import { type UpdateNoteBody, type UpdateNoteQuery } from 'pages/api/notes/[id]'

export default function useContentMutation() {
  const { push, query } = useRouter()
  const { hrType, type, urlPath } = useContentType()
  const queryClient = useQueryClient()

  const mutation = useMutation<NoteMetaData | TodoMetaData, unknown, ContentMutation>(
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
        default: {
          throw new Error(`Unsupported ${hrType} mutation type.`)
        }
      }
    },
    {
      onSuccess: (newContentData, variables) => {
        queryClient.invalidateQueries(CONTENT_TREE_QUERY_KEY)

        if (
          variables.mutationType === 'add' ||
          (variables.mutationType === 'update' &&
            typeof query.id === 'string' &&
            newContentData.id === parseInt(query.id, 10))
        )
          push(`${urlPath}/${newContentData.id}/${newContentData.slug}`)
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

type AddContentData = AddNoteBody | AddTodoBody
type UpdateContentData = Omit<UpdateNoteBody, 'type'> & UpdateNoteQuery

export type ContentMutation = Mutation<AddContentData, 'add'> | Mutation<UpdateContentData, 'update'>
