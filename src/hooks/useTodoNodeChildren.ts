import { useAtomValue } from 'jotai/react'
import { selectAtom } from 'jotai/vanilla/utils'
import { useCallback } from 'react'

import { todoNodeChildrenAtom } from 'atoms/todoNode'
import { type TodoNodesData, type TodoNodeData } from 'libs/db/todoNodes'

export function useTodoNodeChildren(id: TodoNodeData['id']) {
  return useAtomValue(
    selectAtom(
      todoNodeChildrenAtom,
      useCallback((childrenMap: TodoNodesData['children']) => childrenMap[id], [id])
    )
  )
}
