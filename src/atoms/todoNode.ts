import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

import { addAtIndex, removeAtIndex } from 'libs/array'
import { type TodoNodeDataWithParentId, type TodoNodeData, type TodoNodesData } from 'libs/db/todoNodes'
import { CaretDirection } from 'libs/html'

export const todoNodeChildrenAtom = atomWithReset<TodoNodesData['children']>({ root: [] })

export const todoNodeNodesAtom = atomWithReset<TodoNodesData['nodes']>({})

export const todoNodeMutations = atomWithReset<Record<TodoNodeData['id'], 'insert' | 'update' | 'delete'>>({})

export const updateContentAtom = atom(null, (get, set, { content, id }: AtomParamsContentUpdate) => {
  const node = get(todoNodeNodesAtom)[id]

  if (!node) {
    return
  }

  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: prevMutations[id] ?? 'update' }))

  set(todoNodeNodesAtom, (prevNodes) => ({ ...prevNodes, [id]: { ...node, content } }))
})

export const updateNoteAtom = atom(null, (get, set, { id, noteHtml, noteText }: AtomParamsNoteUpdate) => {
  const node = get(todoNodeNodesAtom)[id]

  if (!node) {
    return
  }

  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: prevMutations[id] ?? 'update' }))

  set(todoNodeNodesAtom, (prevNodes) => ({ ...prevNodes, [id]: { ...node, noteHtml, noteText } }))
})

export const toggleCollapsedAtom = atom(null, (get, set, { id }: AtomParamsWithParentId) => {
  const node = get(todoNodeNodesAtom)[id]
  const nodeChildrenIds = get(todoNodeChildrenAtom)[id]

  if (!node || !nodeChildrenIds || nodeChildrenIds.length === 0) {
    return
  }

  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: prevMutations[id] ?? 'update' }))

  set(todoNodeNodesAtom, (prevNodes) => ({ ...prevNodes, [id]: { ...node, collapsed: !node.collapsed } }))
})

export const toggleCompletedAtom = atom(null, (get, set, { id }: AtomParamsWithParentId) => {
  const node = get(todoNodeNodesAtom)[id]

  if (!node) {
    return
  }

  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: prevMutations[id] ?? 'update' }))

  set(todoNodeNodesAtom, (prevNodes) => ({ ...prevNodes, [id]: { ...node, completed: !node.completed } }))
})

export const addNodeAtom = atom(null, (get, set, { id, newId, parentId = 'root' }: AtomParamsNodeAddition) => {
  const node = get(todoNodeNodesAtom)[id]
  const children = get(todoNodeChildrenAtom)
  const nodeChildrenIds = children[id]

  const addAsChildren = node?.collapsed === false && nodeChildrenIds && nodeChildrenIds.length > 0

  set(todoNodeNodesAtom, (prevNodes) => ({
    ...prevNodes,
    [newId]: {
      id: newId,
      collapsed: false,
      completed: false,
      content: '',
      noteHtml: null,
      noteText: null,
      parentId: addAsChildren ? id : parentId === 'root' ? undefined : parentId,
    },
  }))

  set(todoNodeChildrenAtom, (prevChildren) => {
    if (addAsChildren) {
      parentId = id
    }

    const parentChildren = prevChildren[parentId] ?? []
    const newNodeIndex = parentChildren.indexOf(id) + 1

    const newParentChildren = addAsChildren
      ? [newId, ...(prevChildren[id] ?? [])]
      : addAtIndex(parentChildren, newNodeIndex, newId)

    return {
      ...prevChildren,
      [newId]: [],
      [parentId]: newParentChildren,
    }
  })

  set(todoNodeMutations, (prevMutations) => {
    const newState: typeof prevMutations = { ...prevMutations, [newId]: 'insert' }
    const idToUpdate = addAsChildren ? id : parentId

    newState[idToUpdate] = newState[idToUpdate] ?? 'update'

    return newState
  })
})

export const deleteNodeAtom = atom(null, (get, set, { id, parentId = 'root' }: AtomParamsWithParentId) => {
  if (parentId === 'root') {
    const root = get(todoNodeChildrenAtom).root

    if (root.length - 1 === 0) {
      return
    }
  }

  set(todoNodeNodesAtom, (prevNodes) => {
    const { [id]: nodeToDelete, ...otherNodes } = prevNodes

    return otherNodes
  })

  set(todoNodeChildrenAtom, (prevChildren) => {
    const parentChildren = prevChildren[parentId] ?? []
    const nodeIndex = prevChildren[parentId]?.indexOf(id) ?? -1

    const newParentChildren = removeAtIndex(parentChildren, nodeIndex)

    return {
      ...prevChildren,
      [parentId]: newParentChildren,
    }
  })

  set(todoNodeMutations, (prevMutations) => {
    const newState: typeof prevMutations = { ...prevMutations, [id]: 'delete' }

    if (parentId !== 'root') {
      newState[parentId] = newState[parentId] ?? 'update'
    }

    return newState
  })
})

export const nestNodeAtom = atom(null, (get, set, { id, parentId = 'root' }: AtomParamsWithParentId) => {
  const parentChildren = get(todoNodeChildrenAtom)[parentId]

  if (!parentChildren) {
    return
  }

  const nodeIndex = parentChildren.indexOf(id)
  const sibblingId = parentChildren[nodeIndex - 1]
  const nodes = get(todoNodeNodesAtom)
  const node = nodes[id]

  if (!sibblingId || !node) {
    return
  }

  set(todoNodeChildrenAtom, (prevChildren) => {
    const sibblingChildren = prevChildren[sibblingId]

    return {
      ...prevChildren,
      [parentId]: removeAtIndex(parentChildren, nodeIndex),
      [sibblingId]: [...(sibblingChildren ?? []), id],
    }
  })

  set(todoNodeNodesAtom, (prevNodes) => ({
    ...prevNodes,
    [id]: { ...node, parentId: sibblingId },
  }))

  set(todoNodeMutations, (prevMutations) => ({
    ...prevMutations,
    [id]: prevMutations[id] ?? 'update',
    [parentId]: prevMutations[parentId] ?? 'update',
    [sibblingId]: prevMutations[sibblingId] ?? 'update',
  }))
})

export const unnestNodeAtom = atom(null, (get, set, { id, parentId }: AtomParamsWithParentId) => {
  if (!parentId) {
    return
  }

  const nodes = get(todoNodeNodesAtom)
  const node = nodes[id]
  const parent = nodes[parentId]

  if (!node || !parent) {
    return
  }

  set(todoNodeChildrenAtom, (prevChildren) => {
    const parentChildren = prevChildren[parentId]

    if (!parentChildren) {
      return prevChildren
    }

    const nodeIndex = parentChildren.indexOf(id)
    const grandParentId = parent.parentId ?? 'root'
    const grandParentChildren = prevChildren[grandParentId] ?? []
    const parentIndex = grandParentChildren.indexOf(parentId)

    return {
      ...prevChildren,
      [parentId]: removeAtIndex(parentChildren, nodeIndex),
      [grandParentId]: addAtIndex(grandParentChildren, parentIndex + 1, id),
    }
  })

  set(todoNodeNodesAtom, (prevNodes) => ({
    ...prevNodes,
    [id]: { ...node, parentId: parent.parentId },
  }))

  set(todoNodeMutations, (prevMutations) => {
    const newState: typeof prevMutations = {
      ...prevMutations,
      [id]: prevMutations[id] ?? 'update',
      [parentId]: prevMutations[parentId] ?? 'update',
    }

    if (parent.parentId) {
      newState[parent.parentId] = newState[parent.parentId] ?? 'update'
    }

    return newState
  })
})

export const moveNodeAtom = atom(null, (get, set, { direction, id, parentId = 'root' }: AtomParamsWithDirection) => {
  const parentChildren = get(todoNodeChildrenAtom)[parentId]

  if (!parentChildren) {
    return
  }

  const nodeIndex = parentChildren.indexOf(id)
  const sibblingId = parentChildren[nodeIndex + (direction === 'up' ? -1 : 1)]

  if (!sibblingId) {
    return
  }

  set(todoNodeChildrenAtom, (prevChildren) => {
    return {
      ...prevChildren,
      [parentId]:
        direction === 'up'
          ? [...parentChildren.slice(0, nodeIndex - 1), id, sibblingId, ...parentChildren.slice(nodeIndex + 1)]
          : [...parentChildren.slice(0, nodeIndex), sibblingId, id, ...parentChildren.slice(nodeIndex + 2)],
    }
  })

  if (parentId !== 'root') {
    set(todoNodeMutations, (prevMutations) => ({
      ...prevMutations,
      [parentId]: prevMutations[parentId] ?? 'update',
    }))
  }
})

export function getClosestNode(
  { direction, id, parentId = 'root' }: AtomParamsWithDirection,
  nodes: TodoNodesData['nodes'],
  children: TodoNodesData['children'],
  skipChildren = false
): TodoNodeDataWithParentId | undefined {
  if (!skipChildren && direction === 'down') {
    const nodeChildren = children[id]
    const firstChildId = nodeChildren?.[0]

    if (firstChildId) {
      return nodes[firstChildId]
    }
  }

  const parentChildren = children[parentId]

  if (!parentChildren) {
    return
  }

  const nodeIndex = parentChildren.indexOf(id)
  const sibblingId = parentChildren[nodeIndex + (direction === 'up' ? -1 : 1)]

  if (!sibblingId) {
    if (direction === 'up') {
      return nodes[parentId]
    } else if (direction === 'down' && parentId !== 'root') {
      return getClosestNode({ direction, id: parentId, parentId: nodes[parentId]?.parentId }, nodes, children, true)
    }

    return
  }

  return direction === 'up' ? getLastNestedChildren(sibblingId, nodes, children) : nodes[sibblingId]
}

function getLastNestedChildren(
  from: TodoNodeData['id'],
  nodes: TodoNodesData['nodes'],
  children: TodoNodesData['children']
): TodoNodeDataWithParentId | undefined {
  const nodeChildren = children[from]

  if (nodeChildren) {
    const lastChildId = nodeChildren[nodeChildren.length - 1]

    if (lastChildId) {
      return getLastNestedChildren(lastChildId, nodes, children)
    }
  }

  return nodes[from]
}

interface AtomParamsWithParentId {
  id: TodoNodeData['id']
  parentId?: TodoNodeData['id']
}

interface AtomParamsContentUpdate {
  content: string
  id: TodoNodeData['id']
}

export interface AtomParamsNoteUpdate {
  id: TodoNodeData['id']
  noteHtml: string
  noteText: string
}

interface AtomParamsNodeAddition extends AtomParamsWithParentId {
  newId: TodoNodeData['id']
}

export interface AtomParamsWithDirection extends AtomParamsWithParentId {
  direction: CaretDirection
}
