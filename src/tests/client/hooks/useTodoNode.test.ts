import faker from '@faker-js/faker'
import cuid from 'cuid'
import { useAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { act, renderHook } from '@testing-library/react-hooks/native'

import { todoChildrenAtom, todoNodeMutations, todoNodesAtom } from 'atoms/todos'
import useTodoNode from 'hooks/useTodoNode'
import {
  type TodoNodeDataWithParentId,
  type TodoNodeChildrenMapWithRoot,
  type TodoNodeDataMap,
  type TodoNodeData,
} from 'libs/db/todoNodes'

describe('useTodoNode', () => {
  describe('node', () => {
    test('should not return a todo node if no todo nodes are defined', () => {
      const { result } = renderHook(() => useTodoNode('nonexistingId'))

      expect(result.current.node).toBeUndefined()
    })

    test('should not return a todo node if not found', () => {
      setFakeTodoNodes([])

      const { result } = renderHook(() => useTodoNode('nonexistingId'))

      expect(result.current.node).toBeUndefined()
    })

    test('should return a root todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      expect(isEqualTodoNode(nodes, node.id, result.current.node)).toBe(true)
    })

    test('should return a nested todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      expect(isEqualTodoNode(nodes, node.id, result.current.node)).toBe(true)
    })
  })

  describe('updateContent', () => {
    test('should update a root todo node content', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const newContent = 'new content'

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.updateContent({ id: node.id, content: newContent })
      })

      expect(result.current.node?.content).toBe(newContent)
    })

    test('should update a nested todo node content', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const newContent = 'new content'

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.updateContent({ id: node.id, content: newContent })
      })

      expect(result.current.node?.content).toBe(newContent)
    })

    test('should mark an existing todo node as updated', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

      act(() => {
        result.current.updateContent({ id: node.id, content: 'new content' })
      })

      expect(todoMutations.current[node.id]).toBe('update')
    })

    test('should not mark a new todo node as updated', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutations))

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'insert' }))

        result.current.updateContent({ id: node.id, content: 'new content' })
      })

      expect(todoMutations.current[0][node.id]).toBe('insert')
    })

    test('should not update a nonexisting todo node content', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const newContent = 'new content'

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.updateContent({ id: 'nonexistingId', content: newContent })
      })

      expect(result.current.node?.content).toBe(nodes[node.id]?.content)
    })

    test('should not update a deleted todo node content', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtom(todoNodesAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutations))

      act(() => {
        const { [node.id]: nodeToDelete, ...otherNodes } = todoNodes.current[0]
        todoNodes.current[1](otherNodes)

        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'delete' }))

        result.current.updateContent({ id: node.id, content: 'new content' })
      })

      expect(result.current.node).toBeUndefined()
      expect(todoMutations.current[0][node.id]).toBe('delete')
    })
  })
})

function getTodoNodeFromIndexes(
  nodes: TodoNodeDataMap,
  children: TodoNodeChildrenMapWithRoot,
  ...indexes: number[]
): TodoNodeDataWithParentId {
  const error = new Error(`Unable to find todo node at indexes: ${indexes.join(' - ')}.`)

  const [rootIndex, ...nestedIndexes] = indexes
  const rootId = children.root[rootIndex ?? -1]

  if (!rootId) {
    throw error
  }

  let currentNodeId: string = rootId

  for (const nestedIndex of nestedIndexes) {
    const nestedChildren = children[currentNodeId]
    const childId = nestedChildren?.[nestedIndex]

    if (!childId) {
      throw error
    }

    currentNodeId = childId
  }

  const node = nodes[currentNodeId]

  if (!node) {
    throw error
  }

  return node
}

function isEqualTodoNode(nodes: TodoNodeDataMap, id: TodoNodeData['id'], node: TodoNodeDataWithParentId | undefined) {
  if (!id || !node) {
    return false
  }

  const currentNode = nodes[id]

  if (!currentNode) {
    return false
  }

  return currentNode.id === node.id && currentNode.content === node.content && currentNode.parentId === node.parentId
}

function setFakeTodoNodes(nodeDeclarations: FakeTodoNodeDeclaration[]) {
  const children: TodoNodeChildrenMapWithRoot = { root: [] }
  const nodes: TodoNodeDataMap = {}

  children.root = parseFakeTodoNodes(nodeDeclarations, undefined, children, nodes)

  const { result: setTodoChildren } = renderHook(() => useUpdateAtom(todoChildrenAtom))
  const { result: setTodoNodes } = renderHook(() => useUpdateAtom(todoNodesAtom))

  act(() => {
    setTodoChildren.current(children)
    setTodoNodes.current(nodes)
  })

  return { children, nodes }
}

function parseFakeTodoNodes(
  nodeDeclarations: FakeTodoNodeDeclaration[],
  parentId: TodoNodeDataWithParentId['parentId'],
  children: TodoNodeChildrenMapWithRoot,
  nodes: TodoNodeDataMap
) {
  const nodeIds: string[] = []

  for (const declaration of nodeDeclarations) {
    const node = getFakeTodoNode(parentId)

    nodeIds.push(node.id)

    nodes[node.id] = node

    if (declaration.children) {
      const childrenIds = parseFakeTodoNodes(declaration.children, node.id, children, nodes)

      children[node.id] = childrenIds
    } else {
      children[node.id] = []
    }
  }

  return nodeIds
}

function getFakeTodoNode(parentId: TodoNodeDataWithParentId['parentId']): TodoNodeDataWithParentId {
  return {
    id: cuid(),
    content: faker.lorem.words(),
    parentId,
  }
}

interface FakeTodoNodeDeclaration {
  children?: FakeTodoNodeDeclaration[]
}
