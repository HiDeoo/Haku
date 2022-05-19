import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from 'react-query'

import { getContentTreeQueryKey } from 'hooks/useContentTreeQuery'
import { ContentType } from 'hooks/useContentType'
import { getFilesQueryKey } from 'hooks/useFilesQuery'
import { getClient } from 'libs/api/client'
import { type TodoMetadata } from 'libs/db/todo'
import { type ImportDynalistBody } from 'pages/api/import/dynalist'

export function useImportDynalistMutation() {
  const { push } = useRouter()
  const queryClient = useQueryClient()

  return useMutation<TodoMetadata | void, unknown, ImportDynalistMutation>(
    (data) => {
      return importDynalist(data)
    },
    {
      onSuccess: (newMetadata) => {
        if (newMetadata) {
          queryClient.invalidateQueries(getContentTreeQueryKey(ContentType.TODO))
          queryClient.invalidateQueries(getFilesQueryKey())

          push(`/todos/${newMetadata.id}/${newMetadata.slug}`)
        }
      },
    }
  )
}

async function importDynalist(data: ImportDynalistBody) {
  return (await getClient()).post('import/dynalist', { json: data }).json<TodoMetadata>()
}

interface ImportDynalistMutation {
  opml: string
}
