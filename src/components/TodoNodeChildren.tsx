import { selectAtom, useAtomValue } from 'jotai/utils'
import { memo, useCallback, useContext } from 'react'

import { todoNodeChildrenAtom } from 'atoms/todoNode'
import TodoNodeItem, { TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS, type TodoNodeItemHandle } from 'components/TodoNodeItem'
import { TodoContext } from 'hooks/useTodoNode'
import { type TodoNodeData, type TodoNodesData } from 'libs/db/todoNodes'
import clst from 'styles/clst'

const TodoNodeChildren: React.FC<TodoNodeChildren> = ({ id = 'root', level = 0 }) => {
  const todoNodeItems = useContext(TodoContext)

  const children = useAtomValue(
    selectAtom(
      todoNodeChildrenAtom,
      useCallback((childrenMap: TodoNodesData['children'], nodeId = id) => childrenMap[nodeId], [id])
    )
  )

  const setTodoNodeItemRef = useCallback(
    (id: TodoNodeData['id'], item: TodoNodeItemHandle | null) => {
      if (item) {
        todoNodeItems.set(id, item)
      } else {
        todoNodeItems.delete(id)
      }
    },
    [todoNodeItems]
  )

  const childrenClasses = clst({ 'border-l border-zinc-700': level > 0 })

  return (
    <div className={childrenClasses} style={{ marginLeft: level * TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS }}>
      {children?.map((childId) => (
        <TodoNodeItem
          ref={(ref) => {
            setTodoNodeItemRef(childId, ref)
          }}
          id={childId}
          key={childId}
          level={level}
        />
      ))}
    </div>
  )
}

export default memo(TodoNodeChildren)

interface TodoNodeChildren {
  id?: TodoNodeData['id']
  level?: number
}
