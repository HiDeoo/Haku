import { useState } from 'react'

// import TodoNodeItem from 'components/TodoNodeItem'
import useContentId from 'hooks/useContentId'
import useTodo from 'hooks/useTodo'

const Todo: React.FC = () => {
  // TODO(HiDeoo)
  const [enabled, setEnabled] = useState(true)

  const contentId = useContentId()
  const { isLoading } = useTodo(contentId, {
    // TODO(HiDeoo)
    enabled,
    onSuccess: () => {
      // TODO(HiDeoo)
      setEnabled(false)

      // TODO(HiDeoo) Jotai
    },
  })

  if (isLoading) {
    // TODO(HiDeoo)
    return <div>Loading…</div>
  }

  return (
    <>
      {/* {todoRoot.map((rootId) => (
        <TodoNodeItem key={rootId} id={rootId} />
      ))} */}
    </>
  )
}

export default Todo
