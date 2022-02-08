import { selectAtom, useAtomCallback, useAtomValue, useUpdateAtom } from 'jotai/utils'
import { createContext, useCallback } from 'react'

import { type TodoSyncStatus, todoSyncStatusAtom } from 'atoms/todo'
import {
  type AtomParamsWithDirection,
  getClosestNode,
  todoNodeNodesAtom,
  todoNodeChildrenAtom,
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
        getClosestNode(params, get(todoNodeNodesAtom), get(todoNodeChildrenAtom))?.id,
      []
    )
  )

  const node = useAtomValue(selectAtom(todoNodeNodesAtom, getNodeById))

  const updateContent = useUpdateAtom(updateContentAtom)
  const toggleCollapsed = useUpdateAtom(toggleCollapsedAtom)
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
    toggleCollapsed,
    toggleCompleted,
    unnestNode,
    updateContent,
    updateNote,
  }
}
