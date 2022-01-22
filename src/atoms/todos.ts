import cuid from 'cuid'
import { atom } from 'jotai'

import { type TodoNodeData, type TodoNodesData } from 'libs/db/todoNodes'

export const todoRootAtom = atom<TodoNodesData['root']>([])

export const todoNodesAtom = atom<TodoNodesData['nodes']>({})

export const todoNodeMutations = atom<Record<TodoNodeData['id'], 'insert' | 'update' | 'delete'>>({})

export const updateContentAtom = atom(null, (get, set, { content, id }: UpdateContentAtomUpdate) => {
  const node = get(todoNodesAtom)[id]

  if (!node) {
    return
  }

  const nodeMutation = get(todoNodeMutations)[id]

  if (!nodeMutation) {
    set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: 'update' }))
  }

  set(todoNodesAtom, (prevNodes) => ({ ...prevNodes, [id]: { ...node, content } }))
})

export const addNodeAtom = atom(null, (_get, set, { id, parentId }: AddNodeAtomUpdate) => {
  const newNodeId = cuid()

  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [newNodeId]: 'insert' }))

  set(todoNodesAtom, (prevNodes) => ({
    ...prevNodes,
    [newNodeId]: { id: newNodeId, content: '', children: [], parentId: parentId },
  }))

  if (!parentId) {
    set(todoRootAtom, (prevRoot) => {
      const newNodeIndex = prevRoot.indexOf(id) + 1

      return [...prevRoot.slice(0, newNodeIndex), newNodeId, ...prevRoot.slice(newNodeIndex)]
    })
  } else {
    // TODO(HiDeoo) Update parent of current node
  }
})

export const deleteNodeAtom = atom(null, (_get, set, { id, parentId }: DeleteNodeAtomUpdate) => {
  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: 'delete' }))

  set(todoNodesAtom, (prevNodes) => {
    const { [id]: nodeToDelete, ...otherNodes } = prevNodes

    return otherNodes
  })

  if (!parentId) {
    set(todoRootAtom, (prevRoot) => {
      const nodeIndex = prevRoot.indexOf(id)

      return [...prevRoot.slice(0, nodeIndex), ...prevRoot.slice(nodeIndex + 1)]
    })
  } else {
    // TODO(HiDeoo) Update parent of current node
  }
})

interface UpdateContentAtomUpdate {
  content: string
  id: TodoNodeData['id']
}

interface AddNodeAtomUpdate {
  id: TodoNodeData['id']
  parentId?: TodoNodeData['id']
}

interface DeleteNodeAtomUpdate {
  id: TodoNodeData['id']
  parentId?: TodoNodeData['id']
}
