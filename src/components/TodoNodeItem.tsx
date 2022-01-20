import { useCallback } from 'react'

import { type TodoNodeData } from 'libs/db/todoNodes'
import { useStore } from 'stores'

const TodoNodeItem: React.FC<TodoNodeItemProps> = ({ id, level = 0 }) => {
  const [node, updateTodoNodeContent] = useStore(
    useCallback((state) => [state.todoNodes[id], state.updateTodoNodeContent], [id])
  )

  function onChangeText(event: React.ChangeEvent<HTMLInputElement>) {
    updateTodoNodeContent(id, event.target.value)
  }

  if (!node) {
    return null
  }

  return (
    <div style={{ paddingLeft: level * 20 }}>
      <div>
        {id} - <input type="text" value={node.content} onChange={onChangeText} className="text-black" />
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
