import { useRef } from 'react'
import { useEditable } from 'use-editable'

import { type TodoNodeData } from 'libs/db/todoNodes'
import useTodoNode from 'hooks/useTodoNode'

const TodoNodeItem: React.FC<TodoNodeItemProps> = ({ id, level = 0 }) => {
  const contentRef = useRef<HTMLDivElement>(null)

  const { node, updateContent } = useTodoNode(id)

  useEditable(contentRef, updateContent)

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  if (!node) {
    return null
  }

  return (
    <div style={{ paddingLeft: level * 20 }} className="m-3">
      <div>{id}</div>
      <div className="bg-blue-200 text-black" ref={contentRef} onKeyDown={onKeyDown}>
        {node.content}
      </div>
      {node.children.map((childId) => (
        <TodoNodeItem key={childId} id={childId} level={level + 1} />
      ))}
    </div>
  )
}

export default TodoNodeItem

interface TodoNodeItemProps {
  id: TodoNodeData['id']
  level?: number
}
