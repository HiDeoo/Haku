import { useMutation } from 'react-query'

import client, { type Mutation } from 'libs/api/client'
import { type NoteData } from 'libs/db/note'
import useContentType, { ContentType } from 'hooks/useContentType'
import { type TodoData } from 'libs/db/todo'
import { type UpdateNoteBody, type UpdateNoteQuery } from 'pages/api/notes/[id]'

export default function useContentMutation() {
  const { lcType, type } = useContentType()

  return useMutation<NoteData | TodoData | void, unknown, ContentMutation>((data) => {
    if (!type) {
      throw new Error(`Missing content type to ${data.mutationType} content.`)
    }

    switch (data.mutationType) {
      case 'update': {
        if (type === ContentType.TODO) {
          // TODO(HiDeoo)
          throw new Error('Unimplemented')
        }

        return updateNote({ id: data.id, html: data.html, text: data.text })
      }
      default: {
        throw new Error(`Unsupported ${lcType} content mutation type.`)
      }
    }
  })
}

function updateNote({ id, ...data }: UpdateData) {
  return client.patch(`notes/${id}`, { json: data }).json<NoteData>()
}

type UpdateData = Required<Pick<UpdateNoteBody, 'html' | 'text'>> & UpdateNoteQuery

export type ContentMutation = Mutation<UpdateData, 'update'>
