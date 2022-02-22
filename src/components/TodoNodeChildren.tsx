import { memo } from 'react'

import TodoNodeItem, { type TodoNodeItemHandle } from 'components/TodoNodeItem'
import { TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS } from 'constants/ui'
import { type TodoNodeData } from 'libs/db/todoNodes'
import clst from 'styles/clst'
import useTodoNodeChildren from 'hooks/useTodoNodeChildren'

const TodoNodeChildren: React.FC<TodoNodeChildrenProps> = ({
  id = 'root',
  level = 0,
  onFocusTodoNode,
  setTodoNodeItemRef,
}) => {
  const children = useTodoNodeChildren(id)

  const childrenClasses = clst({ 'border-l border-zinc-700': level > 0 })

  return (
    <div className={childrenClasses} style={{ marginLeft: level * TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS }}>
      {children?.map((childId) => (
        <TodoNodeItem
          setTodoNodeItemRef={setTodoNodeItemRef}
          onFocusTodoNode={onFocusTodoNode}
          level={level}
          key={childId}
          id={childId}
          ref={(ref) => {
            setTodoNodeItemRef(childId, ref)
          }}
        />
      ))}
    </div>
  )
}

export default memo(TodoNodeChildren)

export interface TodoNodeChildrenProps {
  id?: TodoNodeData['id']
  level?: number
  onFocusTodoNode: (todoNodeId: TodoNodeData['id']) => void
  setTodoNodeItemRef: (id: TodoNodeData['id'], item: TodoNodeItemHandle | null) => void
}
