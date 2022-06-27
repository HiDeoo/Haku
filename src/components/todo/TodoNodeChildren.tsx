import { memo } from 'react'

import { TodoNodeItem, type TodoNodeItemHandle } from 'components/todo/TodoNodeItem'
import { TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS } from 'constants/ui'
import { useTodoNodeChildren } from 'hooks/useTodoNodeChildren'
import { type TodoNodeData } from 'libs/db/todoNodes'
import { clst } from 'styles/clst'

export const TodoNodeChildren: React.FC<TodoNodeChildrenProps> = memo(
  ({ id = 'root', level = 0, onFocusTodoNode, setTodoNodeItemRef }) => {
    const children = useTodoNodeChildren(id)

    const childrenClasses = clst(level > 0 && 'border-l border-zinc-700')

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
)

TodoNodeChildren.displayName = 'TodoNodeChildren'

export interface TodoNodeChildrenProps {
  id?: TodoNodeData['id']
  level?: number
  onFocusTodoNode: (todoNodeId: TodoNodeData['id']) => void
  setTodoNodeItemRef: (id: TodoNodeData['id'], item: TodoNodeItemHandle | null) => void
}
