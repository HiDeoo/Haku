import { ContentType, useContentType } from 'hooks/useContentType'
import { trpc } from 'libs/trpc'

export function useContentTreeUtils() {
  const { type } = useContentType()

  const utils = trpc.useContext()

  return type === ContentType.NOTE ? utils.note.list : utils.todo.list
}
