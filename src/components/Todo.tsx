import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useState } from 'react'

import { todoNodesAtom, todoRootAtom } from 'atoms/todos'
import TodoNodeItem from 'components/TodoNodeItem'
import useContentId from 'hooks/useContentId'
import useTodo from 'hooks/useTodo'

const Todo: React.FC = () => {
  // TODO(HiDeoo)
  const [enabled, setEnabled] = useState(true)

  const [todoRoot, setTodoRoot] = useAtom(todoRootAtom)
  const setTodoNodes = useUpdateAtom(todoNodesAtom)

  const contentId = useContentId()
  const { isLoading } = useTodo(contentId, {
    // TODO(HiDeoo)
    enabled,
    onSuccess: ({ nodes, root }) => {
      // TODO(HiDeoo)
      setEnabled(false)

      setTodoRoot(root)
      setTodoNodes(nodes)
    },
  })

  if (isLoading) {
    // TODO(HiDeoo)
    return <div>Loading…</div>
  }

  return (
    <>
      {todoRoot.map((rootId) => (
        <TodoNodeItem key={rootId} id={rootId} />
      ))}
    </>
  )
}

export default Todo
