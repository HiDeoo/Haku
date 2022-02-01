import { selectAtom, useAtomCallback, useAtomValue, useUpdateAtom } from 'jotai/utils'
import { createContext, useCallback } from 'react'

import {
  type AtomParamsWithDirection,
  addNodeAtom,
  deleteNodeAtom,
  moveNodeAtom,
  nestNodeAtom,
  todoChildrenAtom,
  todoNodesAtom,
  unnestNodeAtom,
  updateContentAtom,
  getClosestNode,
} from 'atoms/todos'
import { type TodoNodeItemHandle } from 'components/TodoNodeItem'
import { type TodoNodeData } from 'libs/db/todoNodes'

export const todoNodeContentRefs = new Map<TodoNodeData['id'], TodoNodeItemHandle>()

export const TodoContext = createContext(todoNodeContentRefs)

export default function useTodoNode(id: TodoNodeData['id']) {
  const getNodeById = useCallback(
    <TData>(nodesMap: Record<TodoNodeData['id'], TData>, nodeId = id) => nodesMap[nodeId],
    [id]
  )

  const getClosestNodeId = useAtomCallback(
    useCallback(
      (get, _set, params: AtomParamsWithDirection) =>
        getClosestNode(params, get(todoNodesAtom), get(todoChildrenAtom))?.id,
      []
    )
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
