import { useMutation } from 'react-query'

import useContentType, { ContentType } from 'hooks/useContentType'
import client, { type Mutation } from 'libs/api/client'
import { type NoteData } from 'libs/db/note'
import { type TodoNodesData } from 'libs/db/todoNodes'
import { type UpdateNoteBody, type UpdateNoteQuery } from 'pages/api/notes/[id]'
import { type UpdateTodoNodesBody, type UpdateTodoNodesQuery } from 'pages/api/todos/[id]/nodes'

export default function useContentMutation() {
  const { lcType, type } = useContentType()

  return useMutation<NoteData | TodoNodesData | void, unknown, ContentMutation>((data) => {
    if (!type) {
      throw new Error(`Missing content type to ${data.action} content.`)
    }

    switch (data.action) {
      case 'update': {
        const isTodoData = isUpdateTodoData(data)

        if (type === ContentType.TODO && isTodoData) {
          return updateTodo({ id: data.id, children: data.children, mutations: data.mutations })
        } else if (type === ContentType.NOTE && !isTodoData) {
          return updateNote({ id: data.id, html: data.html, text: data.text })
        } else {
          throw new Error(`Invalid ${lcType} content mutation data.`)
        }
      }
      default: {
        throw new Error(`Unsupported ${lcType} content mutation type.`)
      }
    }
  })
}

function updateNote({ id, ...data }: UpdateNoteData) {
  return client.patch(`notes/${id}`, { json: data }).json<NoteData>()
}

async function updateTodo({ id, ...data }: UpdateTodoData) {
  await client.patch(`todos/${id}/nodes`, { json: data })
}

function isUpdateTodoData(data: UpdateData): data is UpdateTodoData {
  return (
    typeof (data as UpdateTodoData).children !== 'undefined' &&
    typeof (data as UpdateTodoData).mutations !== 'undefined'
  )
}

type UpdateNoteData = Required<Pick<UpdateNoteBody, 'html' | 'text'>> & UpdateNoteQuery
type UpdateTodoData = UpdateTodoNodesBody & UpdateTodoNodesQuery

type UpdateData = UpdateNoteData | UpdateTodoData

export type ContentMutation = Mutation<UpdateData, 'update'>
