import { selectAtom, useAtomValue } from 'jotai/utils'
import { memo, useCallback } from 'react'

import { todoChildrenAtom } from 'atoms/todos'
import TodoNodeItem from 'components/TodoNodeItem'
import { type TodoNodeData, type TodoNodesData } from 'libs/db/todoNodes'

const TodoNodeChildren: React.FC<TodoNodeChildren> = ({ id = 'root', level = 0 }) => {
  const children = useAtomValue(
    selectAtom(
      todoChildrenAtom,
      useCallback((childrenMap: TodoNodesData['children'], nodeId = id) => childrenMap[nodeId], [id])
    )
  )

  return (
    <>
      {children?.map((childId) => (
        <TodoNodeItem key={childId} id={childId} level={level} />
      ))}
    </>
  )
}

export default memo(TodoNodeChildren)

interface TodoNodeChildren {
  id?: TodoNodeData['id']
  level?: number
}
