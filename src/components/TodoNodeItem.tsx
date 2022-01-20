import { useCallback, useRef } from 'react'
import { useEditable } from 'use-editable'

import { type TodoNodeData } from 'libs/db/todoNodes'

const TodoNodeItem: React.FC<TodoNodeItemProps> = ({ id, level = 0 }) => {
  const contentRef = useRef<HTMLDivElement>(null)

  const updateContent = useCallback(() => {
    // TODO(HiDeoo) Jotai
  }, [])

  useEditable(contentRef, updateContent)

  // function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
  //   if (event.key === 'Enter') {
  //     event.preventDefault()
  //   }
  // }

  // TODO(HiDeoo)
  // if (!node) {
  //   return null
  // }

  return (
    <div style={{ paddingLeft: level * 20 }}>
      <div>{id}</div>
      {/* <div className="bg-blue-200 text-black" ref={contentRef} onKeyDown={onKeyDown}>
        {node.content}
      </div>
      {node.children.map((childId) => (
        <TodoNodeItem key={childId} id={childId} level={level + 1} />
      ))} */}
    </div>
  )
}

export default TodoNodeItem

interface TodoNodeItemProps {
  id: TodoNodeData['id']
  level?: number
}
