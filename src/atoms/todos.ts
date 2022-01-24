import cuid from 'cuid'
import { atom } from 'jotai'

import { type TodoNodeData, type TodoNodesData } from 'libs/db/todoNodes'

export const todoChildrenAtom = atom<TodoNodesData['children']>({ root: [] })

export const todoNodesAtom = atom<TodoNodesData['nodes']>({})

export const todoNodeMutations = atom<Record<TodoNodeData['id'], 'insert' | 'update' | 'delete'>>({})

// TODO(HiDeoo) When done with all possible mutations, make sure to review all entities marked as mutated and to include
// all of them.

export const updateContentAtom = atom(null, (get, set, { content, id }: UpdateContentAtomUpdate) => {
  const node = get(todoNodesAtom)[id]

  if (!node) {
    return
  }

  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: prevMutations[id] ?? 'update' }))

  set(todoNodesAtom, (prevNodes) => ({ ...prevNodes, [id]: { ...node, content } }))
})

export const addNodeAtom = atom(null, (get, set, { id, parentId }: AtomUpdateWithParentId) => {
  const newNodeId = cuid()

  const children = get(todoChildrenAtom)
  const nodeChildrenIds = children[id]

  const addAsChildren = nodeChildrenIds && nodeChildrenIds.length > 0

  set(todoNodesAtom, (prevNodes) => ({
    ...prevNodes,
    [newNodeId]: { id: newNodeId, content: '', parentId: addAsChildren ? id : parentId },
  }))

  set(todoChildrenAtom, (prevChildren) => {
    if (addAsChildren) {
      parentId = id
    } else if (!parentId) {
      parentId = 'root'
    }

    const parentChildren = prevChildren[parentId] ?? []
    const newNodeIndex = parentChildren.indexOf(id) + 1

    const newParentChildren = addAsChildren
      ? [newNodeId, ...(prevChildren[id] ?? [])]
      : [...parentChildren.slice(0, newNodeIndex), newNodeId, ...parentChildren.slice(newNodeIndex)]

    return {
      ...prevChildren,
      [newNodeId]: [],
      [parentId]: newParentChildren,
    }
  })

  set(todoNodeMutations, (prevMutations) => {
    const newState: typeof prevMutations = { ...prevMutations, [newNodeId]: 'insert' }
    const idToUpdate = addAsChildren ? id : parentId ?? 'root'

    newState[idToUpdate] = newState[idToUpdate] ?? 'update'

    return newState
  })
})

export const deleteNodeAtom = atom(null, (_get, set, { id, parentId }: AtomUpdateWithParentId) => {
  set(todoNodesAtom, (prevNodes) => {
    const { [id]: nodeToDelete, ...otherNodes } = prevNodes

    return otherNodes
  })

  set(todoChildrenAtom, (prevChildren) => {
    if (!parentId) {
      parentId = 'root'
    }

    const parentChildren = prevChildren[parentId] ?? []
    const nodeIndex = prevChildren[parentId]?.indexOf(id) ?? -1

    const newParentChildren = [...parentChildren.slice(0, nodeIndex), ...parentChildren.slice(nodeIndex + 1)]

    return {
      ...prevChildren,
      [parentId]: newParentChildren,
    }
  })

  set(todoNodeMutations, (prevMutations) => {
    const newState: typeof prevMutations = { ...prevMutations, [id]: 'delete' }

    if (parentId && parentId !== 'root') {
      newState[parentId] = newState[parentId] ?? 'update'
    }

    return newState
  })
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

export const unnestNodeAtom = atom(null, (get, set, { id, parentId }: AtomUpdateWithParentId) => {
  if (!parentId) {
    return
  }

  const nodes = get(todoNodesAtom)
  const node = nodes[id]
  const parent = nodes[parentId]

  if (!node || !parent) {
    return
  }

  if (!parent.parentId) {
    set(todoChildrenAtom, (prevChildren) => {
      const parentChildren = prevChildren[parentId]

      if (!parentChildren) {
        return prevChildren
      }

      const nodeIndex = parentChildren.indexOf(id)
      const parentIndex = prevChildren.root.indexOf(parentId)

      return {
        ...prevChildren,
        [parentId]: [...parentChildren.slice(0, nodeIndex), ...parentChildren.slice(nodeIndex + 1)],
        root: [...prevChildren.root.slice(0, parentIndex + 1), id, ...prevChildren.root.slice(parentIndex + 1)],
      }
    })

    set(todoNodesAtom, (prevNodes) => ({ ...prevNodes, [id]: { ...node, parentId: undefined } }))
  } else {
    // TODO(HiDeoo) Handle not at root + 1
  }

  // TODO(HiDeoo) Refactor / extract
  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: prevMutations[id] ?? 'update' }))
})

interface UpdateContentAtomUpdate {
  content: string
  id: TodoNodeData['id']
}

interface AtomUpdateWithParentId {
  id: TodoNodeData['id']
  parentId?: TodoNodeData['id']
}
