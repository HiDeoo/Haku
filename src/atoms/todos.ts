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

  set(todoNodeMutations, (prevMutations) => ({ ...prevMutations, [id]: prevMutations[id] ?? 'update' }))

  set(todoNodesAtom, (prevNodes) => ({ ...prevNodes, [id]: { ...node, content } }))
})

export const addNodeAtom = atom(null, (_get, set, { id, parentId }: AtomUpdateWithParentId) => {
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

export const deleteNodeAtom = atom(null, (_get, set, { id, parentId }: AtomUpdateWithParentId) => {
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

export const nestNodeAtom = atom(null, (get, set, { id, parentId }: AtomUpdateWithParentId) => {
  if (!parentId) {
    const root = get(todoRootAtom)
    const nodeIndex = root.indexOf(id)
    const sibblingId = root[nodeIndex - 1]

    if (!sibblingId) {
      return
    }

    const nodes = get(todoNodesAtom)
    const node = nodes[id]
    const sibbling = nodes[sibblingId]

    if (!node || !sibbling) {
      return
    }

    set(todoRootAtom, (prevRoot) => [...prevRoot.slice(0, nodeIndex), ...prevRoot.slice(nodeIndex + 1)])

    set(todoNodesAtom, (prevNodes) => ({
      ...prevNodes,
      [sibblingId]: { ...sibbling, children: [...sibbling.children, id] },
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
