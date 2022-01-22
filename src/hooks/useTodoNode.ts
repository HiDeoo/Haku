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

      if (!mutation) {
        setMutations((prevMutations) => ({ ...prevMutations, [node.id]: 'update' }))
      }

      setNodes((prevNodes) => ({ ...prevNodes, [node.id]: { ...node, content } }))
    },
    [mutation, node, setMutations, setNodes]
  )

  // TODO(HiDeoo) Based on the current caret position, we should either add before, after or split the current node.
  const addNode = useCallback(() => {
    if (!node) {
      return
    }

    const newNodeId = cuid()

    setMutations((prevMutations) => ({ ...prevMutations, [newNodeId]: 'insert' }))
    setNodes((prevNodes) => ({
      ...prevNodes,
      [newNodeId]: { id: newNodeId, content: '', children: [], parentId: node.parentId },
    }))

    if (!node.parentId) {
      setRoot((prevRoot) => {
        const newNodeIndex = prevRoot.indexOf(node.id) + 1

        return [...prevRoot.slice(0, newNodeIndex), newNodeId, ...prevRoot.slice(newNodeIndex)]
      })
    } else {
      // TODO(HiDeoo) Update parent of current node
    }
  }, [node, setMutations, setNodes, setRoot])

  const removeNode = useCallback(() => {
    if (!node) {
      return
    }

    setMutations((prevMutations) => ({ ...prevMutations, [node.id]: 'delete' }))
    setNodes((prevNodes) => {
      const { [node.id]: nodeToDelete, ...otherNodes } = prevNodes

      return otherNodes
    })

    if (!node.parentId) {
      setRoot((prevRoot) => {
        const nodeIndex = prevRoot.indexOf(node.id)

        return [...prevRoot.slice(0, nodeIndex), ...prevRoot.slice(nodeIndex + 1)]
      })
    } else {
      // TODO(HiDeoo) Update parent of current node
    }
  }, [node, setMutations, setNodes, setRoot])

  return { addNode, node, removeNode, updateContent }
}
