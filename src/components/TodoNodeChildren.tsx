import { selectAtom, useAtomValue } from 'jotai/utils'
import { memo, useCallback, useContext } from 'react'

import { todoChildrenAtom } from 'atoms/todos'
import TodoNodeItem, { type TodoNodeItemHandle } from 'components/TodoNodeItem'
import { TodoContext } from 'hooks/useTodoNode'
import { type TodoNodeData, type TodoNodesData } from 'libs/db/todoNodes'

const TodoNodeChildren: React.FC<TodoNodeChildren> = ({ id = 'root', level = 0 }) => {
  const todoNodeItems = useContext(TodoContext)

  const children = useAtomValue(
    selectAtom(
      todoChildrenAtom,
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

  return (
    <>
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
    </>
  )
}

export default memo(TodoNodeChildren)

interface TodoNodeChildren {
  id?: TodoNodeData['id']
  level?: number
}
