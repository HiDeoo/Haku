import { useCallback, useRef } from 'react'
import { useEditable } from 'use-editable'

import { type TodoNodeData } from 'libs/db/todoNodes'
import { useStore } from 'stores'

const TodoNodeItem: React.FC<TodoNodeItemProps> = ({ id, level = 0 }) => {
  const contentRef = useRef<HTMLDivElement>(null)

  const [node, updateTodoNodeContent] = useStore(
    useCallback((state) => [state.todoNodes[id], state.updateTodoNodeContent], [id])
  )

  const updateContent = useCallback(
    (content: string) => {
      updateTodoNodeContent(id, content)
    },
    [id, updateTodoNodeContent]
  )

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
    <div style={{ paddingLeft: level * 20 }}>
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
