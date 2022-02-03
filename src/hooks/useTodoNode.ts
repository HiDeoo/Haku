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
  getClosestNode,
  type TodoSyncStatus,
  todoSyncStatusAtom,
  toggleCompletedAtom,
  updateNoteAtom,
} from 'atoms/todos'
import { type TodoNodeItemHandle } from 'components/TodoNodeItem'
import { type TodoNodeData } from 'libs/db/todoNodes'

export const todoNodeContentRefs = new Map<TodoNodeData['id'], TodoNodeItemHandle>()

export const TodoContext = createContext(todoNodeContentRefs)

function isLoadingSyncStatusSelector(syncStatus: TodoSyncStatus) {
  return syncStatus.isLoading
}

export default function useTodoNode(id: TodoNodeData['id']) {
  const getNodeById = useCallback(
    <TData>(nodesMap: Record<TodoNodeData['id'], TData>, nodeId = id) => nodesMap[nodeId],
    [id]
  )

  const isLoading = useAtomValue(selectAtom(todoSyncStatusAtom, isLoadingSyncStatusSelector))

  const getClosestNodeId = useAtomCallback(
    useCallback(
      (get, _set, params: AtomParamsWithDirection) =>
        getClosestNode(params, get(todoNodesAtom), get(todoChildrenAtom))?.id,
      []
    )
  )

  const node = useAtomValue(selectAtom(todoNodesAtom, getNodeById))

  const updateContent = useUpdateAtom(updateContentAtom)
  const toggleCompleted = useUpdateAtom(toggleCompletedAtom)
  const updateNote = useUpdateAtom(updateNoteAtom)
  const addNode = useUpdateAtom(addNodeAtom)
  const deleteNode = useUpdateAtom(deleteNodeAtom)
  const nestNode = useUpdateAtom(nestNodeAtom)
  const unnestNode = useUpdateAtom(unnestNodeAtom)
  const moveNode = useUpdateAtom(moveNodeAtom)

  return {
    addNode,
    deleteNode,
    getClosestNodeId,
    isLoading,
    moveNode,
    nestNode,
    node,
    toggleCompleted,
    unnestNode,
    updateContent,
    updateNote,
  }
}
