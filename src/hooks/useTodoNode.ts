import cuid from 'cuid'
import { selectAtom, useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { todoNodeMutations, todoNodesAtom, todoRootAtom } from 'atoms/todos'
import { type TodoNodeData } from 'libs/db/todoNodes'

export default function useTodoNode(id: TodoNodeData['id']) {
  const getById = useCallback(
    <TData>(nodesMap: Record<TodoNodeData['id'], TData>, nodeId = id) => nodesMap[nodeId],
    [id]
  )

  const node = useAtomValue(selectAtom(todoNodesAtom, getById))
  const setNodes = useUpdateAtom(todoNodesAtom)
  const mutation = useAtomValue(selectAtom(todoNodeMutations, getById))
  const setMutations = useUpdateAtom(todoNodeMutations)
  const setRoot = useUpdateAtom(todoRootAtom)

  const updateContent = useCallback(
    (content: string) => {
      if (!node) {
        return
      }

      setNodes((prevNodes) => ({ ...prevNodes, [node.id]: { ...node, content } }))

      if (!mutation) {
        setMutations((prevMutations) => ({ ...prevMutations, [node.id]: 'update' }))
      }
    },
    [mutation, node, setMutations, setNodes]
  )

  // TODO(HiDeoo) Based on the current caret position, we should either add before, after or split the current node.
  const addNode = useCallback(
    (parentId?: TodoNodeData['id']) => {
      if (!node) {
        return
      }

      const newNodeId = cuid()

      setNodes((prevNodes) => ({ ...prevNodes, [newNodeId]: { id: newNodeId, content: '', children: [], parentId } }))
      setMutations((prevMutations) => ({ ...prevMutations, [newNodeId]: 'insert' }))

      if (!parentId) {
        setRoot((prevRoot) => {
          const nodeIndex = prevRoot.indexOf(node.id) + 1

          return [...prevRoot.slice(0, nodeIndex), newNodeId, ...prevRoot.slice(nodeIndex)]
        })
      } else {
        // TODO(HiDeoo) Update parent of current node (ID passed down as parameter)
      }
    },
    [node, setMutations, setNodes, setRoot]
  )

  return { addNode, node, updateContent }
}
