import cuid from 'cuid'
import { atom } from 'jotai'

import { type TodoNodeData, type TodoNodesData } from 'libs/db/todoNodes'

export const todoChildrenAtom = atom<TodoNodesData['children']>({ root: [] })

export const todoNodesAtom = atom<TodoNodesData['nodes']>({})

export const todoNodeMutations = atom<Record<TodoNodeData['id'], 'insert' | 'update' | 'delete'>>({})

export const updateContentAtom = atom(null, (get, set, { content, id }: UpdateContentAtomUpdate) => {
  const node = get(todoNodesAtom)[id]

  if (!node) {
    return
  }

  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: prevMutations[id] ?? 'update' }))

  set(todoNodesAtom, (prevNodes) => ({ ...prevNodes, [id]: { ...node, content } }))
})

export const addNodeAtom = atom(null, (_get, set, { id, parentId }: AtomUpdateWithParentId) => {
  const newNodeId = cuid()

  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [newNodeId]: 'insert' }))

  set(todoNodesAtom, (prevNodes) => ({
    ...prevNodes,
    [newNodeId]: { id: newNodeId, content: '', parentId: parentId },
  }))

  if (!parentId) {
    set(todoChildrenAtom, (prevChildren) => {
      const newNodeIndex = prevChildren.root.indexOf(id) + 1

      return {
        ...prevChildren,
        root: [...prevChildren.root.slice(0, newNodeIndex), newNodeId, ...prevChildren.root.slice(newNodeIndex)],
        [newNodeId]: [],
      }
    })
  } else {
    // TODO(HiDeoo) Update parent of current node
  }
})

export const deleteNodeAtom = atom(null, (_get, set, { id, parentId }: AtomUpdateWithParentId) => {
  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: 'delete' }))

  set(todoNodesAtom, (prevNodes) => {
    const { [id]: nodeToDelete, ...otherNodes } = prevNodes

    return otherNodes
  })

  if (!parentId) {
    set(todoChildrenAtom, (prevChildren) => {
      const nodeIndex = prevChildren.root.indexOf(id)

      return {
        ...prevChildren,
        root: [...prevChildren.root.slice(0, nodeIndex), ...prevChildren.root.slice(nodeIndex + 1)],
      }
    })
  } else {
    // TODO(HiDeoo) Update parent of current node
  }
})

export const nestNodeAtom = atom(null, (get, set, { id, parentId }: AtomUpdateWithParentId) => {
  if (!parentId) {
    const root = get(todoChildrenAtom).root
    const nodeIndex = root.indexOf(id)
    const sibblingId = root[nodeIndex - 1]

    if (!sibblingId) {
      return
    }

    const nodes = get(todoNodesAtom)
    const node = nodes[id]

    if (!node) {
      return
    }

    set(todoChildrenAtom, (prevChildren) => {
      const sibblingChildren = prevChildren[sibblingId]

      return {
        ...prevChildren,
        root: [...prevChildren.root.slice(0, nodeIndex), ...prevChildren.root.slice(nodeIndex + 1)],
        [sibblingId]: [...(sibblingChildren ?? []), id],
      }
    })

    set(todoNodesAtom, (prevNodes) => ({
      ...prevNodes,
      [id]: { ...node, parentId: sibblingId },
    }))

    set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: prevMutations[id] ?? 'update' }))
  } else {
    // TODO(HiDeoo) Handle not at root
  }
})

interface UpdateContentAtomUpdate {
  content: string
  id: TodoNodeData['id']
}

interface AtomUpdateWithParentId {
  id: TodoNodeData['id']
  parentId?: TodoNodeData['id']
}
