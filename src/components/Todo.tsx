import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'

import { todoChildrenAtom, todoNodesAtom } from 'atoms/todos'
import TodoNodeChildren from 'components/TodoNodeChildren'
import useContentId from 'hooks/useContentId'
import useTodo from 'hooks/useTodo'
import { TodoContext, todoNodeContentRefs } from 'hooks/useTodoNode'

const Todo: React.FC = () => {
  // TODO(HiDeoo)
  const [enabled, setEnabled] = useState(true)

  const setTodoChildren = useUpdateAtom(todoChildrenAtom)
  const setTodoNodes = useUpdateAtom(todoNodesAtom)

  const contentId = useContentId()
  const { isLoading } = useTodo(contentId, {
    // TODO(HiDeoo)
    enabled,
    onSuccess: ({ children, nodes }) => {
      // TODO(HiDeoo)
      setEnabled(false)

      setTodoChildren(children)
      setTodoNodes(nodes)
    },
  })

  useEffect(() => {
    return () => {
      todoNodeContentRefs.clear()
    }
  }, [])

  if (isLoading) {
    // TODO(HiDeoo)
    return <div>Loading…</div>
  }

  // FIXME(HiDeoo)
  console.log('#### rendering Todo')

  return (
    <TodoContext.Provider value={todoNodeContentRefs}>
      <TodoNodeChildren />
    </TodoContext.Provider>
  )
}

export default Todo
