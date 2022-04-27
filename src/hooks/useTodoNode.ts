import { useAtomValue, useSetAtom } from 'jotai'
import { selectAtom, useAtomCallback } from 'jotai/utils'
import { createContext, useCallback } from 'react'

import { type TodoSyncStatus, todoSyncStatusAtom } from 'atoms/todo'
import {
  type AtomParamsWithDirection,
  getClosestNode,
  todoNodeNodesAtom,
  todoNodeChildrenAtom,
  toggleCancelledAtom,
  updateContentAtom,
  toggleCompletedAtom,
  updateNoteAtom,
  addNodeAtom,
  deleteNodeAtom,
  nestNodeAtom,
  unnestNodeAtom,
  moveNodeAtom,
  toggleCollapsedAtom,
} from 'atoms/todoNode'
import { type TodoNodeItemHandle } from 'components/todo/TodoNodeItem'
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
        getClosestNode(params, get(todoNodeNodesAtom), get(todoNodeChildrenAtom))?.id,
      []
    )
  )

  const node = useAtomValue(selectAtom(todoNodeNodesAtom, getNodeById))

  const updateContent = useSetAtom(updateContentAtom)
  const toggleCancelled = useSetAtom(toggleCancelledAtom)
  const toggleCollapsed = useSetAtom(toggleCollapsedAtom)
  const toggleCompleted = useSetAtom(toggleCompletedAtom)
  const updateNote = useSetAtom(updateNoteAtom)
  const addNode = useSetAtom(addNodeAtom)
  const deleteNode = useSetAtom(deleteNodeAtom)
  const nestNode = useSetAtom(nestNodeAtom)
  const unnestNode = useSetAtom(unnestNodeAtom)
  const moveNode = useSetAtom(moveNodeAtom)

  return {
    addNode,
    deleteNode,
    getClosestNodeId,
    isLoading,
    moveNode,
    nestNode,
    node,
    toggleCancelled,
    toggleCollapsed,
    toggleCompleted,
    unnestNode,
    updateContent,
    updateNote,
  }
}
