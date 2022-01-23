import { selectAtom, useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { addNodeAtom, deleteNodeAtom, nestNodeAtom, todoNodesAtom, updateContentAtom } from 'atoms/todos'
import { type TodoNodeData } from 'libs/db/todoNodes'

export default function useTodoNode(id: TodoNodeData['id']) {
  const getNodeById = useCallback(
    <TData>(nodesMap: Record<TodoNodeData['id'], TData>, nodeId = id) => nodesMap[nodeId],
    [id]
  )

  const node = useAtomValue(selectAtom(todoNodesAtom, getNodeById))

  const updateContent = useUpdateAtom(updateContentAtom)
  const addNode = useUpdateAtom(addNodeAtom)
  const deleteNode = useUpdateAtom(deleteNodeAtom)
  const nestNode = useUpdateAtom(nestNodeAtom)

  return { addNode, deleteNode, nestNode, node, updateContent }
}
