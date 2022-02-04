import { selectAtom, useAtomValue } from 'jotai/utils'
import { memo, useCallback } from 'react'

import { todoNodeChildrenAtom } from 'atoms/todoNode'
import TodoNodeItem, { TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS, type TodoNodeItemHandle } from 'components/TodoNodeItem'
import { type TodoNodeData, type TodoNodesData } from 'libs/db/todoNodes'
import clst from 'styles/clst'

const TodoNodeChildren: React.FC<TodoNodeChildrenProps> = ({
  id = 'root',
  level = 0,
  onFocusTodoNode,
  setTodoNodeItemRef,
}) => {
  const children = useAtomValue(
    selectAtom(
      todoNodeChildrenAtom,
      useCallback((childrenMap: TodoNodesData['children'], nodeId = id) => childrenMap[nodeId], [id])
    )
  )

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
