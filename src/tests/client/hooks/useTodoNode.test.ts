import assert from 'assert'

import { faker } from '@faker-js/faker'
import { TodoNodeStatus } from '@prisma/client'
import { act, renderHook } from '@testing-library/react'
import cuid from 'cuid'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'

import { todoNodeChildrenAtom, todoNodeMutationsAtom, todoNodeNodesAtom } from 'atoms/todoNode'
import { useTodoNode } from 'hooks/useTodoNode'
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

    test('should mark an existing todo node as updated after updating its content', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.updateContent({ id: node.id, content: 'new content' })
      })

      expect(todoMutations.current[node.id]).toBe('update')
    })

    test('should not mark a new todo node as updated after updating its content', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

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
      const { result: todoNodes } = renderHook(() => useAtom(todoNodeNodesAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

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

  describe('addNode', () => {
    test('should add down a new todo node at the root if the reference todo node does not have any children', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      const newId = cuid()

      act(() => {
        result.current.addNode({ direction: 'down', id: node.id, newId, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(2)
      expect(todoChildren.current.root[0]).toBe(node.id)

      const newTodoNodeId = todoChildren.current.root[1]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.id).toBe(newId)
      expect(todoNodes.current[newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBeUndefined()

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')
    })

    test('should add up a new todo node at the root if the reference todo node does not have any children', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      const newId = cuid()

      act(() => {
        result.current.addNode({ direction: 'up', id: node.id, newId, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(2)

      const newTodoNodeId = todoChildren.current.root[0]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.id).toBe(newId)
      expect(todoNodes.current[newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBeUndefined()

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')

      expect(todoChildren.current.root[1]).toBe(node.id)
    })

    test('should add down a new todo node at the root if the reference todo node has children but is collapsed', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}], collapsed: true }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtom(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      const newId = cuid()

      act(() => {
        result.current.addNode({ direction: 'down', id: node.id, newId, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(2)
      expect(todoChildren.current.root[0]).toBe(node.id)

      const newTodoNodeId = todoChildren.current.root[1]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[0][newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[0][newTodoNodeId]?.id).toBe(newId)
      expect(todoNodes.current[0][newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[0][newTodoNodeId]?.parentId).toBeUndefined()

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')
    })

    test('should add up a new todo node at the root if the reference todo node has children but is collapsed', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}], collapsed: true }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtom(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      const newId = cuid()

      act(() => {
        result.current.addNode({ direction: 'up', id: node.id, newId, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(2)

      const newTodoNodeId = todoChildren.current.root[0]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[0][newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[0][newTodoNodeId]?.id).toBe(newId)
      expect(todoNodes.current[0][newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[0][newTodoNodeId]?.parentId).toBeUndefined()

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')

      expect(todoChildren.current.root[1]).toBe(node.id)
    })

    test('should add down a new child todo node if the existing reference has children', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}], collapsed: false }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)
      const existingChild = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      const newId = cuid()

      act(() => {
        result.current.addNode({ direction: 'down', id: node.id, newId, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(node.id)

      expect(todoChildren.current[node.id]?.length).toBe(2)
      expect(todoChildren.current[node.id]?.[1]).toBe(existingChild.id)

      const newTodoNodeId = todoChildren.current[node.id]?.[0]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.id).toBe(newId)
      expect(todoNodes.current[newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBe(node.id)

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')
      expect(todoMutations.current[node.id]).toBe('update')
    })

    test('should add up a new todo node if the existing reference has children', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}], collapsed: false }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      const newId = cuid()

      act(() => {
        result.current.addNode({ direction: 'up', id: node.id, newId, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(2)

      const newTodoNodeId = todoChildren.current.root[0]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.id).toBe(newId)
      expect(todoNodes.current[newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBeUndefined()

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')

      expect(todoChildren.current.root[1]).toBe(node.id)
    })

    test('should persist the mutation type when adding down a new child todo node if the new reference has children', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}], collapsed: false }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)
      const existingChild = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      const newId = cuid()

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'insert' }))

        result.current.addNode({ direction: 'down', id: node.id, newId, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(node.id)

      expect(todoChildren.current[node.id]?.length).toBe(2)
      expect(todoChildren.current[node.id]?.[1]).toBe(existingChild.id)

      const newTodoNodeId = todoChildren.current[node.id]?.[0]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.id).toBe(newId)
      expect(todoNodes.current[newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBe(node.id)

      expect(todoMutations.current[0][newTodoNodeId]).toBe('insert')
      expect(todoMutations.current[0][node.id]).toBe('insert')
    })

    test('should add down a new nested todo node to the nested reference', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const previousSibbling = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 2)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      const newId = cuid()

      act(() => {
        result.current.addNode({ direction: 'down', id: node.id, newId, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(parent.id)

      expect(todoChildren.current[node.id]?.length).toBe(0)

      expect(todoChildren.current[parent.id]?.length).toBe(4)
      expect(todoChildren.current[parent.id]?.[0]).toBe(previousSibbling.id)
      expect(todoChildren.current[parent.id]?.[1]).toBe(node.id)
      expect(todoChildren.current[parent.id]?.[3]).toBe(nextSibbling.id)

      const newTodoNodeId = todoChildren.current[parent.id]?.[2]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.id).toBe(newId)
      expect(todoNodes.current[newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBe(parent.id)

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')
      expect(todoMutations.current[parent.id]).toBe('update')
    })

    test('should add up a new nested todo node to the nested reference', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const previousSibbling = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 2)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      const newId = cuid()

      act(() => {
        result.current.addNode({ direction: 'up', id: node.id, newId, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(parent.id)

      expect(todoChildren.current[node.id]?.length).toBe(0)

      expect(todoChildren.current[parent.id]?.length).toBe(4)
      expect(todoChildren.current[parent.id]?.[0]).toBe(previousSibbling.id)
      expect(todoChildren.current[parent.id]?.[2]).toBe(node.id)
      expect(todoChildren.current[parent.id]?.[3]).toBe(nextSibbling.id)

      const newTodoNodeId = todoChildren.current[parent.id]?.[1]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.id).toBe(newId)
      expect(todoNodes.current[newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBe(parent.id)

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')
      expect(todoMutations.current[parent.id]).toBe('update')
    })

    test('should add a new todo node with provided content', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      const newId = cuid()

      const newContent = 'new content'

      act(() => {
        result.current.addNode({ direction: 'down', id: node.id, newId, parentId: node.parentId, content: newContent })
      })

      expect(todoChildren.current.root.length).toBe(2)
      expect(todoChildren.current.root[0]).toBe(node.id)

      const newTodoNodeId = todoChildren.current.root[1]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.id).toBe(newId)
      expect(todoNodes.current[newTodoNodeId]?.content).toBe(newContent)
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBeUndefined()

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')
    })
  })

  describe('deleteNode', () => {
    test('should delete a todo node at the root', () => {
      const { children, nodes } = setFakeTodoNodes([{}, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 1)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.deleteNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node).toBeUndefined()
      expect(todoNodes.current[node.id]).toBeUndefined()

      expect(todoChildren.current[node.id]).toBeUndefined()

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(nextSibbling.id)

      expect(todoMutations.current[node.id]).toBe('delete')
    })

    test('should delete a nested todo node in an existing todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 2)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.deleteNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node).toBeUndefined()
      expect(todoNodes.current[node.id]).toBeUndefined()

      expect(todoChildren.current[node.id]).toBeUndefined()

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(parent.id)

      expect(todoChildren.current[parent.id]?.length).toBe(2)
      expect(todoChildren.current[parent.id]?.[0]).toBe(prevSibbling.id)
      expect(todoChildren.current[parent.id]?.[1]).toBe(nextSibbling.id)

      expect(todoMutations.current[node.id]).toBe('delete')
      expect(todoMutations.current[parent.id]).toBe('update')
    })

    test('should persist the mutation type when deleting a nested todo node in a new todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 2)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [parent.id]: 'insert' }))

        result.current.deleteNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node).toBeUndefined()
      expect(todoNodes.current[node.id]).toBeUndefined()

      expect(todoChildren.current[node.id]).toBeUndefined()

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(parent.id)

      expect(todoChildren.current[parent.id]?.length).toBe(2)
      expect(todoChildren.current[parent.id]?.[0]).toBe(prevSibbling.id)
      expect(todoChildren.current[parent.id]?.[1]).toBe(nextSibbling.id)

      expect(todoMutations.current[0][node.id]).toBe('delete')
      expect(todoMutations.current[0][parent.id]).toBe('insert')
    })

    test('should not delete the last todo node at the root', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.deleteNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node).toBeDefined()
      expect(result.current.node?.id).toBe(node.id)

      expect(todoChildren.current[node.id]).toEqual([])

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(node.id)

      expect(todoMutations.current[node.id]).toBeUndefined()
    })

    test('should delete a new todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      const newId = cuid()

      act(() => {
        result.current.addNode({ direction: 'down', id: node.id, newId, parentId: node.parentId })

        result.current.deleteNode({ id: newId })
      })

      expect(result.current.node).toBeDefined()
      expect(result.current.node?.id).toBe(node.id)

      expect(todoChildren.current[newId]).toBeUndefined()

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(node.id)

      expect(todoMutations.current[newId]).toBeUndefined()
    })
  })

  describe('nestNode', () => {
    test('should nest a todo node at the root', () => {
      const { children, nodes } = setFakeTodoNodes([{}, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 1)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.nestNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node?.parentId).toBe(prevSibbling.id)

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(prevSibbling.id)

      expect(todoChildren.current[prevSibbling.id]?.length).toBe(1)
      expect(todoChildren.current[prevSibbling.id]?.[0]).toBe(node.id)

      expect(todoMutations.current[node.id]).toBe('update')
      expect(todoMutations.current[prevSibbling.id]).toBe('update')
    })

    test('should not nest a todo node at the root without a previous sibbling', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.nestNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node?.parentId).toBe(node.parentId)

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(node.id)

      expect(todoMutations.current[node.id]).toBeUndefined()
    })

    test('should nest a nested todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.nestNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node?.parentId).toBe(prevSibbling.id)

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(parent.id)

      expect(todoChildren.current[prevSibbling.id]?.length).toBe(1)
      expect(todoChildren.current[prevSibbling.id]?.[0]).toBe(node.id)

      expect(todoMutations.current[node.id]).toBe('update')
      expect(todoMutations.current[prevSibbling.id]).toBe('update')
      expect(todoMutations.current[parent.id]).toBe('update')
    })

    test('should not nest a nested todo node without a previous sibbling', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.nestNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node?.parentId).toBe(parent.id)

      expect(todoChildren.current.root.length).toBe(1)

      expect(todoChildren.current[parent.id]?.length).toBe(1)
      expect(todoChildren.current[parent.id]?.[0]).toBe(node.id)

      expect(todoMutations.current[node.id]).toBeUndefined()
      expect(todoMutations.current[parent.id]).toBeUndefined()
    })

    test('should persist the mutation type when nesting a new todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{}, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 1)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'insert' }))
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [prevSibbling.id]: 'insert' }))

        result.current.nestNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node?.parentId).toBe(prevSibbling.id)

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(prevSibbling.id)

      expect(todoChildren.current[prevSibbling.id]?.length).toBe(1)
      expect(todoChildren.current[prevSibbling.id]?.[0]).toBe(node.id)

      expect(todoMutations.current[0][node.id]).toBe('insert')
      expect(todoMutations.current[0][prevSibbling.id]).toBe('insert')
    })

    test('should nest a todo node by adding it at the end of the previous sibbling children', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 1)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0)
      const prevSibblingFirstChild = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.nestNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node?.parentId).toBe(prevSibbling.id)

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(prevSibbling.id)

      expect(todoChildren.current[prevSibbling.id]?.length).toBe(2)
      expect(todoChildren.current[prevSibbling.id]?.[0]).toBe(prevSibblingFirstChild.id)
      expect(todoChildren.current[prevSibbling.id]?.[1]).toBe(node.id)

      expect(todoMutations.current[node.id]).toBe('update')
      expect(todoMutations.current[prevSibbling.id]).toBe('update')
    })

    test('should nest a todo node and make sure the new parent is not collapsed', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}], collapsed: true }, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 1)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0)
      const prevSibblingFirstChild = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodeNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.nestNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node?.parentId).toBe(prevSibbling.id)

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(prevSibbling.id)

      expect(todoChildren.current[prevSibbling.id]?.length).toBe(2)
      expect(todoChildren.current[prevSibbling.id]?.[0]).toBe(prevSibblingFirstChild.id)
      expect(todoChildren.current[prevSibbling.id]?.[1]).toBe(node.id)

      expect(todoMutations.current[node.id]).toBe('update')
      expect(todoMutations.current[prevSibbling.id]).toBe('update')

      expect(todoNodes.current[prevSibbling.id]?.collapsed).toBe(false)
    })
  })

  describe('unnestNode', () => {
    test('should not unnest a todo node at the root', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.unnestNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node?.parentId).toBeUndefined()

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(node.id)

      expect(todoMutations.current[node.id]).toBeUndefined()
    })

    test('should unnest a todo node to the root', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const parentNextSibbling = getTodoNodeFromIndexes(nodes, children, 1)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.unnestNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node?.parentId).toBeUndefined()

      expect(todoChildren.current.root.length).toBe(3)
      expect(todoChildren.current.root[0]).toBe(parent.id)
      expect(todoChildren.current.root[1]).toBe(node.id)
      expect(todoChildren.current.root[2]).toBe(parentNextSibbling.id)

      expect(todoMutations.current[node.id]).toBe('update')
      expect(todoMutations.current[parent.id]).toBe('update')
    })

    test('should unnest a nested todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{ children: [{}] }, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0, 0)
      const parent = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const parentNextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const grandParent = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.unnestNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node?.parentId).toBe(grandParent.id)

      expect(todoChildren.current.root.length).toBe(1)

      expect(todoChildren.current[parent.id]?.length).toBe(0)

      expect(todoChildren.current[grandParent.id]?.length).toBe(3)
      expect(todoChildren.current[grandParent.id]?.[0]).toBe(parent.id)
      expect(todoChildren.current[grandParent.id]?.[1]).toBe(node.id)
      expect(todoChildren.current[grandParent.id]?.[2]).toBe(parentNextSibbling.id)

      expect(todoMutations.current[node.id]).toBe('update')
      expect(todoMutations.current[parent.id]).toBe('update')
      expect(todoMutations.current[grandParent.id]).toBe('update')
    })

    test('should persist the mutation type when unnesting a new todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{ children: [{}] }, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0, 0)
      const parent = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const parentNextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const grandParent = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'insert' }))
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [parent.id]: 'insert' }))
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [grandParent.id]: 'insert' }))

        result.current.unnestNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node?.parentId).toBe(grandParent.id)

      expect(todoChildren.current.root.length).toBe(1)

      expect(todoChildren.current[parent.id]?.length).toBe(0)

      expect(todoChildren.current[grandParent.id]?.length).toBe(3)
      expect(todoChildren.current[grandParent.id]?.[0]).toBe(parent.id)
      expect(todoChildren.current[grandParent.id]?.[1]).toBe(node.id)
      expect(todoChildren.current[grandParent.id]?.[2]).toBe(parentNextSibbling.id)

      expect(todoMutations.current[0][node.id]).toBe('insert')
      expect(todoMutations.current[0][parent.id]).toBe('insert')
      expect(todoMutations.current[0][grandParent.id]).toBe('insert')
    })
  })

  describe('move', () => {
    test('should move up a todo node at the root', () => {
      const { children, nodes } = setFakeTodoNodes([{}, {}, {}, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 1)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 2)
      const lastSibbling = getTodoNodeFromIndexes(nodes, children, 3)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.moveNode({ direction: 'up', id: node.id, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(4)
      expect(todoChildren.current.root[0]).toBe(node.id)
      expect(todoChildren.current.root[1]).toBe(prevSibbling.id)
      expect(todoChildren.current.root[2]).toBe(nextSibbling.id)
      expect(todoChildren.current.root[3]).toBe(lastSibbling.id)

      expect(todoMutations.current[node.id]).toBeUndefined()
      expect(todoMutations.current[prevSibbling.id]).toBeUndefined()
      expect(todoMutations.current[nextSibbling.id]).toBeUndefined()
      expect(todoMutations.current[lastSibbling.id]).toBeUndefined()
    })

    test('should move down a todo node at the root', () => {
      const { children, nodes } = setFakeTodoNodes([{}, {}, {}, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 1)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 2)
      const lastSibbling = getTodoNodeFromIndexes(nodes, children, 3)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.moveNode({ direction: 'down', id: node.id, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(4)
      expect(todoChildren.current.root[0]).toBe(prevSibbling.id)
      expect(todoChildren.current.root[1]).toBe(nextSibbling.id)
      expect(todoChildren.current.root[2]).toBe(node.id)
      expect(todoChildren.current.root[3]).toBe(lastSibbling.id)

      expect(todoMutations.current[node.id]).toBeUndefined()
      expect(todoMutations.current[prevSibbling.id]).toBeUndefined()
      expect(todoMutations.current[nextSibbling.id]).toBeUndefined()
      expect(todoMutations.current[lastSibbling.id]).toBeUndefined()
    })

    test('should move up a nested todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}, {}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 2)
      const lastSibbling = getTodoNodeFromIndexes(nodes, children, 0, 3)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.moveNode({ direction: 'up', id: node.id, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(parent.id)

      expect(todoChildren.current[parent.id]?.length).toBe(4)
      expect(todoChildren.current[parent.id]?.[0]).toBe(node.id)
      expect(todoChildren.current[parent.id]?.[1]).toBe(prevSibbling.id)
      expect(todoChildren.current[parent.id]?.[2]).toBe(nextSibbling.id)
      expect(todoChildren.current[parent.id]?.[3]).toBe(lastSibbling.id)

      expect(todoMutations.current[node.id]).toBeUndefined()
      expect(todoMutations.current[prevSibbling.id]).toBeUndefined()
      expect(todoMutations.current[nextSibbling.id]).toBeUndefined()
      expect(todoMutations.current[lastSibbling.id]).toBeUndefined()
      expect(todoMutations.current[parent.id]).toBe('update')
    })

    test('should move down a nested todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}, {}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 2)
      const lastSibbling = getTodoNodeFromIndexes(nodes, children, 0, 3)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.moveNode({ direction: 'down', id: node.id, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(parent.id)

      expect(todoChildren.current[parent.id]?.length).toBe(4)
      expect(todoChildren.current[parent.id]?.[0]).toBe(prevSibbling.id)
      expect(todoChildren.current[parent.id]?.[1]).toBe(nextSibbling.id)
      expect(todoChildren.current[parent.id]?.[2]).toBe(node.id)
      expect(todoChildren.current[parent.id]?.[3]).toBe(lastSibbling.id)

      expect(todoMutations.current[node.id]).toBeUndefined()
      expect(todoMutations.current[prevSibbling.id]).toBeUndefined()
      expect(todoMutations.current[nextSibbling.id]).toBeUndefined()
      expect(todoMutations.current[lastSibbling.id]).toBeUndefined()
      expect(todoMutations.current[parent.id]).toBe('update')
    })

    test('should persist the mutation type when moving a todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 2)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'insert' }))
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [parent.id]: 'insert' }))

        result.current.moveNode({ direction: 'up', id: node.id, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(parent.id)

      expect(todoChildren.current[parent.id]?.length).toBe(3)
      expect(todoChildren.current[parent.id]?.[0]).toBe(node.id)
      expect(todoChildren.current[parent.id]?.[1]).toBe(prevSibbling.id)
      expect(todoChildren.current[parent.id]?.[2]).toBe(nextSibbling.id)

      expect(todoMutations.current[0][node.id]).toBe('insert')
      expect(todoMutations.current[0][prevSibbling.id]).toBeUndefined()
      expect(todoMutations.current[0][nextSibbling.id]).toBeUndefined()
      expect(todoMutations.current[0][parent.id]).toBe('insert')
    })

    test('should not move up a todo node which already is the first child of its parent', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 1)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.moveNode({ direction: 'up', id: node.id, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(parent.id)

      expect(todoChildren.current[parent.id]?.length).toBe(2)
      expect(todoChildren.current[parent.id]?.[0]).toBe(node.id)
      expect(todoChildren.current[parent.id]?.[1]).toBe(nextSibbling.id)

      expect(todoMutations.current[node.id]).toBeUndefined()
      expect(todoMutations.current[nextSibbling.id]).toBeUndefined()
      expect(todoMutations.current[parent.id]).toBeUndefined()
    })

    test('should not move down a todo node which already is the last child of its parent', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoNodeChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.moveNode({ direction: 'down', id: node.id, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(parent.id)

      expect(todoChildren.current[parent.id]?.length).toBe(2)
      expect(todoChildren.current[parent.id]?.[0]).toBe(prevSibbling.id)
      expect(todoChildren.current[parent.id]?.[1]).toBe(node.id)

      expect(todoMutations.current[node.id]).toBeUndefined()
      expect(todoMutations.current[prevSibbling.id]).toBeUndefined()
      expect(todoMutations.current[parent.id]).toBeUndefined()
    })
  })

  describe('getClosestNodeId', () => {
    test('should not return an ID with a single root node', async () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        let id = await result.current.getClosestNodeId({ direction: 'down', id: node.id, parentId: node.parentId })

        expect(id).toBeUndefined()

        id = await result.current.getClosestNodeId({ direction: 'up', id: node.id, parentId: node.parentId })

        expect(id).toBeUndefined()
      })
    })

    test('should return proper values with two root nodes', async () => {
      const { children, nodes } = setFakeTodoNodes([{}, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)
      const closestNode = getTodoNodeFromIndexes(nodes, children, 1)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        let id = await result.current.getClosestNodeId({ direction: 'down', id: node.id, parentId: node.parentId })

        expect(id).toBe(closestNode.id)

        id = await result.current.getClosestNodeId({ direction: 'up', id: node.id, parentId: node.parentId })

        expect(id).toBeUndefined()
      })
    })

    test('should return proper values with two nested nodes', async () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const closestNode = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const rootNode = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        let id = await result.current.getClosestNodeId({ direction: 'down', id: node.id, parentId: node.parentId })

        expect(id).toBe(closestNode.id)

        id = await result.current.getClosestNodeId({ direction: 'up', id: node.id, parentId: node.parentId })

        expect(id).toBe(rootNode.id)
      })
    })

    test('should return proper values with more than two root nodes', async () => {
      const { children, nodes } = setFakeTodoNodes([{}, {}, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 1)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 2)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        let id = await result.current.getClosestNodeId({ direction: 'down', id: node.id, parentId: node.parentId })

        expect(id).toBe(nextSibbling.id)

        id = await result.current.getClosestNodeId({ direction: 'up', id: node.id, parentId: node.parentId })

        expect(id).toBe(prevSibbling.id)
      })
    })

    test('should return proper values with more than two nested nodes', async () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 2)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        let id = await result.current.getClosestNodeId({ direction: 'down', id: node.id, parentId: node.parentId })

        expect(id).toBe(nextSibbling.id)

        id = await result.current.getClosestNodeId({ direction: 'up', id: node.id, parentId: node.parentId })

        expect(id).toBe(prevSibbling.id)
      })
    })

    test('should return the first children if it exists when going down', async () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{ children: [{}] }], collapsed: false }, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)
      const closestNode = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        const id = await result.current.getClosestNodeId({ direction: 'down', id: node.id, parentId: node.parentId })

        expect(id).toBe(closestNode.id)
      })
    })

    test('should not return the first children if it exists and the node is collapsed when going down', async () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{ children: [{}] }], collapsed: true }, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)
      const closestNode = getTodoNodeFromIndexes(nodes, children, 1)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        const id = await result.current.getClosestNodeId({ direction: 'down', id: node.id, parentId: node.parentId })

        expect(id).toBe(closestNode.id)
      })
    })

    test('should return the parent when going up if the node has no sibbling', async () => {
      const { children, nodes } = setFakeTodoNodes([{}, { children: [{}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 1, 0)
      const closestNode = getTodoNodeFromIndexes(nodes, children, 1)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        const id = await result.current.getClosestNodeId({ direction: 'up', id: node.id, parentId: node.parentId })

        expect(id).toBe(closestNode.id)
      })
    })

    test('should return the last children of the previous sibbling when going up', async () => {
      const { children, nodes } = setFakeTodoNodes([
        { children: [{ children: [{}], collapsed: false }], collapsed: false },
        {},
      ])
      const node = getTodoNodeFromIndexes(nodes, children, 1)
      const closestNode = getTodoNodeFromIndexes(nodes, children, 0, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        const id = await result.current.getClosestNodeId({ direction: 'up', id: node.id, parentId: node.parentId })

        expect(id).toBe(closestNode.id)
      })
    })

    test('should return the last children of the previous sibbling when going up until hitting a collapsed node', async () => {
      const { children, nodes } = setFakeTodoNodes([
        { children: [{ children: [{ children: [{}], collapsed: true }], collapsed: false }], collapsed: false },
        {},
      ])
      const node = getTodoNodeFromIndexes(nodes, children, 1)
      const closestNode = getTodoNodeFromIndexes(nodes, children, 0, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        const id = await result.current.getClosestNodeId({ direction: 'up', id: node.id, parentId: node.parentId })

        expect(id).toBe(closestNode.id)
      })
    })

    test('should walk up the tree to the root when going down', async () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{ children: [{}, {}] }] }, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0, 1)
      const closestNode = getTodoNodeFromIndexes(nodes, children, 1)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        const id = await result.current.getClosestNodeId({ direction: 'down', id: node.id, parentId: node.parentId })

        expect(id).toBe(closestNode.id)
      })
    })

    test('should walk down the tree from the root when going up', async () => {
      const { children, nodes } = setFakeTodoNodes([
        {
          children: [{ children: [{}, { children: [{}, {}], collapsed: false }], collapsed: false }],
          collapsed: false,
        },
        {},
      ])
      const node = getTodoNodeFromIndexes(nodes, children, 1)
      const closestNode = getTodoNodeFromIndexes(nodes, children, 0, 0, 1, 1)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        const id = await result.current.getClosestNodeId({ direction: 'up', id: node.id, parentId: node.parentId })

        expect(id).toBe(closestNode.id)
      })
    })

    test('should walk up the tree when going down', async () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{ children: [{}, {}] }, {}] }, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0, 1)
      const closestNode = getTodoNodeFromIndexes(nodes, children, 0, 1)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        const id = await result.current.getClosestNodeId({ direction: 'down', id: node.id, parentId: node.parentId })

        expect(id).toBe(closestNode.id)
      })
    })

    test('should walk down the tree when going up', async () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{ children: [{}, {}] }, { children: [{}, {}] }] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1, 0)
      const closestNode = getTodoNodeFromIndexes(nodes, children, 0, 1)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        const id = await result.current.getClosestNodeId({ direction: 'up', id: node.id, parentId: node.parentId })

        expect(id).toBe(closestNode.id)
      })
    })

    test('should not return an ID when walking up the tree when going down from the last node', async () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{ children: [{}, {}] }] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0, 1)

      const { result } = renderHook(() => useTodoNode(node.id))

      await act(async () => {
        const id = await result.current.getClosestNodeId({ direction: 'down', id: node.id, parentId: node.parentId })

        expect(id).toBeUndefined()
      })
    })
  })

  describe('toggleCompleted', () => {
    test('should mark as completed an active todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ status: TodoNodeStatus.ACTIVE }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCompleted({ id: node.id })
      })

      expect(result.current.node?.status).toBe(TodoNodeStatus.COMPLETED)
    })

    test('should mark as completed a cancelled todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ status: TodoNodeStatus.ACTIVE }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCompleted({ id: node.id })
      })

      expect(result.current.node?.status).toBe(TodoNodeStatus.COMPLETED)
    })

    test('should mark as active a completed todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ status: TodoNodeStatus.COMPLETED }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCompleted({ id: node.id })
      })

      expect(result.current.node?.status).toBe(TodoNodeStatus.ACTIVE)
    })

    test('should toggle completed a root todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCompleted({ id: node.id })
      })

      expect(result.current.node?.status).toBe(
        node.status !== TodoNodeStatus.COMPLETED ? TodoNodeStatus.COMPLETED : TodoNodeStatus.ACTIVE
      )
    })

    test('should toggle completed a nested todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCompleted({ id: node.id })
      })

      expect(result.current.node?.status).toBe(
        node.status !== TodoNodeStatus.COMPLETED ? TodoNodeStatus.COMPLETED : TodoNodeStatus.ACTIVE
      )
    })

    test('should mark an existing todo node as updated after toggling its completion', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.toggleCompleted({ id: node.id })
      })

      expect(todoMutations.current[node.id]).toBe('update')
    })

    test('should not mark a new todo node as updated after toggling its completion', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'insert' }))

        result.current.toggleCompleted({ id: node.id })
      })

      expect(todoMutations.current[0][node.id]).toBe('insert')
    })

    test('should not toggle completed a nonexisting todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCompleted({ id: 'nonexistingId' })
      })

      expect(result.current.node?.status).toBe(nodes[node.id]?.status)
    })

    test('should not toggle completed a deleted todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtom(todoNodeNodesAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      act(() => {
        const { [node.id]: nodeToDelete, ...otherNodes } = todoNodes.current[0]
        todoNodes.current[1](otherNodes)

        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'delete' }))

        result.current.toggleCompleted({ id: node.id })
      })

      expect(result.current.node).toBeUndefined()
      expect(todoMutations.current[0][node.id]).toBe('delete')
    })
  })

  describe('toggleCancelled', () => {
    test('should mark as cancelled an active todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ status: TodoNodeStatus.ACTIVE }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCancelled({ id: node.id })
      })

      expect(result.current.node?.status).toBe(TodoNodeStatus.CANCELLED)
    })

    test('should mark as cancelled a completed todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ status: TodoNodeStatus.COMPLETED }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCancelled({ id: node.id })
      })

      expect(result.current.node?.status).toBe(TodoNodeStatus.CANCELLED)
    })

    test('should mark as active a cancelled todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ status: TodoNodeStatus.CANCELLED }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCancelled({ id: node.id })
      })

      expect(result.current.node?.status).toBe(TodoNodeStatus.ACTIVE)
    })

    test('should toggle cancelled a root todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCancelled({ id: node.id })
      })

      expect(result.current.node?.status).toBe(
        node.status !== TodoNodeStatus.CANCELLED ? TodoNodeStatus.CANCELLED : TodoNodeStatus.ACTIVE
      )
    })

    test('should toggle cancelled a nested todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCancelled({ id: node.id })
      })

      expect(result.current.node?.status).toBe(
        node.status !== TodoNodeStatus.CANCELLED ? TodoNodeStatus.CANCELLED : TodoNodeStatus.ACTIVE
      )
    })

    test('should mark an existing todo node as updated after toggling its cancellation', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.toggleCancelled({ id: node.id })
      })

      expect(todoMutations.current[node.id]).toBe('update')
    })

    test('should not mark a new todo node as updated after toggling its cancellation', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'insert' }))

        result.current.toggleCancelled({ id: node.id })
      })

      expect(todoMutations.current[0][node.id]).toBe('insert')
    })

    test('should not toggle cancelled a nonexisting todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCancelled({ id: 'nonexistingId' })
      })

      expect(result.current.node?.status).toBe(nodes[node.id]?.status)
    })

    test('should not toggle cancelled a deleted todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtom(todoNodeNodesAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      act(() => {
        const { [node.id]: nodeToDelete, ...otherNodes } = todoNodes.current[0]
        todoNodes.current[1](otherNodes)

        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'delete' }))

        result.current.toggleCancelled({ id: node.id })
      })

      expect(result.current.node).toBeUndefined()
      expect(todoMutations.current[0][node.id]).toBe('delete')
    })
  })

  describe('updateNote', () => {
    test('should update a root todo node note', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const newNote = 'new note'

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.updateNote({ id: node.id, noteHtml: newNote, noteText: newNote })
      })

      expect(result.current.node?.noteHtml).toBe(newNote)
      expect(result.current.node?.noteText).toBe(newNote)
    })

    test('should update a nested todo node note', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const newNote = 'new note'

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.updateNote({ id: node.id, noteHtml: newNote, noteText: newNote })
      })

      expect(result.current.node?.noteHtml).toBe(newNote)
      expect(result.current.node?.noteText).toBe(newNote)
    })

    test('should mark an existing todo node as updated after updating its note', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      const newNote = 'new note'

      act(() => {
        result.current.updateNote({ id: node.id, noteHtml: newNote, noteText: newNote })
      })

      expect(todoMutations.current[node.id]).toBe('update')
    })

    test('should not mark a new todo node as updated after updating its note', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      const newNote = 'new note'

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'insert' }))

        result.current.updateNote({ id: node.id, noteHtml: newNote, noteText: newNote })
      })

      expect(todoMutations.current[0][node.id]).toBe('insert')
    })

    test('should not update a nonexisting todo node note', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const newNote = 'new note'

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.updateNote({ id: 'nonexistingId', noteHtml: newNote, noteText: newNote })
      })

      expect(result.current.node?.noteHtml).toBe(nodes[node.id]?.noteHtml)
      expect(result.current.node?.noteText).toBe(nodes[node.id]?.noteText)
    })

    test('should not update a deleted todo node note', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtom(todoNodeNodesAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      const newNote = 'new note'

      act(() => {
        const { [node.id]: nodeToDelete, ...otherNodes } = todoNodes.current[0]
        todoNodes.current[1](otherNodes)

        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'delete' }))

        result.current.updateNote({ id: node.id, noteHtml: newNote, noteText: newNote })
      })

      expect(result.current.node).toBeUndefined()
      expect(todoMutations.current[0][node.id]).toBe('delete')
    })
  })

  describe('toggleCollapsed', () => {
    test('should not toggle collapsed a todo node without children', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCollapsed({ id: node.id })
      })

      expect(result.current.node?.collapsed).toBe(node.collapsed)
    })

    test('should toggle collapsed a root todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCollapsed({ id: node.id })
      })

      expect(result.current.node?.collapsed).toBe(!node.collapsed)
    })

    test('should toggle collapsed a nested todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{ children: [{}] }] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCollapsed({ id: node.id })
      })

      expect(result.current.node?.collapsed).toBe(!node.collapsed)
    })

    test('should mark an existing todo node as updated after toggling its collapsed state', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutationsAtom))

      act(() => {
        result.current.toggleCollapsed({ id: node.id })
      })

      expect(todoMutations.current[node.id]).toBe('update')
    })

    test('should not mark a new todo node as updated after toggling its collapsed state', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'insert' }))

        result.current.toggleCollapsed({ id: node.id })
      })

      expect(todoMutations.current[0][node.id]).toBe('insert')
    })

    test('should not toggle collapsed a nonexisting todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))

      act(() => {
        result.current.toggleCollapsed({ id: 'nonexistingId' })
      })

      expect(result.current.node?.collapsed).toBe(nodes[node.id]?.collapsed)
    })

    test('should not toggle collapsed a deleted todo node', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtom(todoNodeNodesAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutationsAtom))

      act(() => {
        const { [node.id]: nodeToDelete, ...otherNodes } = todoNodes.current[0]
        todoNodes.current[1](otherNodes)

        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'delete' }))

        result.current.toggleCollapsed({ id: node.id })
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

  const { result: setTodoChildren } = renderHook(() => useSetAtom(todoNodeChildrenAtom))
  const { result: setTodoNodes } = renderHook(() => useSetAtom(todoNodeNodesAtom))

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
    const node = getFakeTodoNode(parentId, declaration.collapsed, declaration.status)

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

function getFakeTodoNode(
  parentId: TodoNodeDataWithParentId['parentId'],
  collapsed?: boolean,
  status?: TodoNodeStatus
): TodoNodeDataWithParentId {
  const data = faker.datatype.boolean() ? faker.lorem.sentences() : null

  return {
    id: cuid(),
    content: faker.lorem.words(),
    collapsed: collapsed ?? faker.datatype.boolean(),
    noteHtml: data,
    noteText: data,
    parentId,
    status:
      status ?? faker.helpers.arrayElement([TodoNodeStatus.ACTIVE, TodoNodeStatus.COMPLETED, TodoNodeStatus.CANCELLED]),
  }
}

interface FakeTodoNodeDeclaration {
  children?: FakeTodoNodeDeclaration[]
  collapsed?: boolean
  status?: TodoNodeStatus
}
