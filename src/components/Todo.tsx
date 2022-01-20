import { useState } from 'react'

import TodoNodeItem from 'components/TodoNodeItem'
import useContentId from 'hooks/useContentId'
import useTodo from 'hooks/useTodo'
import { StoreState, useStore } from 'stores'

const storeSelector = (state: StoreState) => [state.todoRoot, state.setTodoNodes] as const

const Todo: React.FC = () => {
  // TODO(HiDeoo)
  const [enabled, setEnabled] = useState(true)

  const [todoRoot, setTodoNodes] = useStore(storeSelector)

  const contentId = useContentId()
  const { isLoading } = useTodo(contentId, {
    // TODO(HiDeoo)
    enabled,
    onSuccess: (data) => {
      setEnabled(false)
      setTodoNodes(data)
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
