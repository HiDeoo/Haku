import { atom, useAtom } from 'jotai'
import { selectAtom, useAtomValue } from 'jotai/utils'
import { useCallback, useMemo } from 'react'

import { todoNodesAtom, todoNodeUpdatesAtom } from 'atoms/todos'
import { TodoNodeDataMap, type TodoNodeData } from 'libs/db/todoNodes'

export default function useTodoNode(id: TodoNodeData['id']) {
  const getTodoNodeById = useCallback((nodesMap: TodoNodeDataMap) => nodesMap[id], [id])

  const baseNode = useAtomValue(selectAtom(todoNodesAtom, getTodoNodeById))

  const updatedNodeAtom = useMemo(
    () =>
      atom<TodoNodeData | undefined, TodoNodeData>(
        (get) => get(todoNodeUpdatesAtom)[id],
        (get, set, newValue) => {
          set(todoNodeUpdatesAtom, { ...get(todoNodeUpdatesAtom), [newValue.id]: newValue })
        }
      ),
    [id]
  )

  const [updatedNode, setUpdatedNode] = useAtom(updatedNodeAtom)

  const node = updatedNode ?? baseNode

  const updateContent = useCallback(
    (content: string) => {
      if (node) {
        setUpdatedNode({ ...node, content })
      }
    },
    [node, setUpdatedNode]
  )

  return { node, updateContent }
}
