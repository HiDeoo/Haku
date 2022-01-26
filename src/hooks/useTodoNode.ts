import { selectAtom, useAtomCallback, useAtomValue, useUpdateAtom } from 'jotai/utils'
import { createContext, useCallback } from 'react'

import {
  addNodeAtom,
  type AtomParamsWithDirection,
  deleteNodeAtom,
  moveNodeAtom,
  nestNodeAtom,
  todoChildrenAtom,
  todoNodesAtom,
  unnestNodeAtom,
  updateContentAtom,
} from 'atoms/todos'
import { type TodoNodeData } from 'libs/db/todoNodes'

export const todoNodeContentRefs = new Map()

export const TodoContext = createContext(todoNodeContentRefs)

export default function useTodoNode(id: TodoNodeData['id']) {
  const getNodeById = useCallback(
    <TData>(nodesMap: Record<TodoNodeData['id'], TData>, nodeId = id) => nodesMap[nodeId],
    [id]
  )

  const getClosestNodeId = useAtomCallback(
    useCallback((get, _set, { direction, id, parentId = 'root' }: AtomParamsWithDirection) => {
      const parentChildren = get(todoChildrenAtom)[parentId]

      if (!parentChildren) {
        return
      }

      const nodeIndex = parentChildren.indexOf(id)
      const sibblingId = parentChildren[nodeIndex + (direction === 'up' ? -1 : 1)]

      return sibblingId
    }, [])
  )

  const node = useAtomValue(selectAtom(todoNodesAtom, getNodeById))

  const updateContent = useUpdateAtom(updateContentAtom)
  const addNode = useUpdateAtom(addNodeAtom)
  const deleteNode = useUpdateAtom(deleteNodeAtom)
  const nestNode = useUpdateAtom(nestNodeAtom)
  const unnestNode = useUpdateAtom(unnestNodeAtom)
  const moveNode = useUpdateAtom(moveNodeAtom)

  return { addNode, deleteNode, getClosestNodeId, moveNode, nestNode, node, unnestNode, updateContent }
}
