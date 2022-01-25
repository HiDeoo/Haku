import assert from 'assert'

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

  describe('addNode', () => {
    test('should add a new todo node at the root if the reference todo node does not have any children', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

      act(() => {
        result.current.addNode({ id: node.id, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(2)
      expect(todoChildren.current.root[0]).toBe(node.id)

      const newTodoNodeId = todoChildren.current.root[1]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.id).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBeUndefined()

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')
    })

    test('should add a new child todo node if the existing reference has children', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)
      const existingChild = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

      act(() => {
        result.current.addNode({ id: node.id, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(node.id)

      expect(todoChildren.current[node.id]?.length).toBe(2)
      expect(todoChildren.current[node.id]?.[1]).toBe(existingChild.id)

      const newTodoNodeId = todoChildren.current[node.id]?.[0]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.id).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBe(node.id)

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')
      expect(todoMutations.current[node.id]).toBe('update')
    })

    test('should persist the mutation type when adding a new child todo node if the new reference has children', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0)
      const existingChild = getTodoNodeFromIndexes(nodes, children, 0, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutations))

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [node.id]: 'insert' }))

        result.current.addNode({ id: node.id, parentId: node.parentId })
      })

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(node.id)

      expect(todoChildren.current[node.id]?.length).toBe(2)
      expect(todoChildren.current[node.id]?.[1]).toBe(existingChild.id)

      const newTodoNodeId = todoChildren.current[node.id]?.[0]
      assert(newTodoNodeId)

      expect(todoChildren.current[newTodoNodeId]).toEqual([])

      expect(todoNodes.current[newTodoNodeId]).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.id).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBe(node.id)

      expect(todoMutations.current[0][newTodoNodeId]).toBe('insert')
      expect(todoMutations.current[0][node.id]).toBe('insert')
    })

    test('should add a new nested todo node to the nested reference', () => {
      const { children, nodes } = setFakeTodoNodes([{ children: [{}, {}, {}] }])
      const node = getTodoNodeFromIndexes(nodes, children, 0, 1)
      const parent = getTodoNodeFromIndexes(nodes, children, 0)
      const previousSibbling = getTodoNodeFromIndexes(nodes, children, 0, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 0, 2)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

      act(() => {
        result.current.addNode({ id: node.id, parentId: node.parentId })
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
      expect(todoNodes.current[newTodoNodeId]?.id).toBeDefined()
      expect(todoNodes.current[newTodoNodeId]?.content).toBe('')
      expect(todoNodes.current[newTodoNodeId]?.parentId).toBe(parent.id)

      expect(todoMutations.current[newTodoNodeId]).toBe('insert')
      expect(todoMutations.current[parent.id]).toBe('update')
    })
  })

  describe('deleteNode', () => {
    test('should delete a todo node at the root', () => {
      const { children, nodes } = setFakeTodoNodes([{}, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)
      const nextSibbling = getTodoNodeFromIndexes(nodes, children, 1)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

      act(() => {
        result.current.deleteNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node).toBeUndefined()
      expect(todoNodes.current[node.id]).toBeUndefined()

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
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

      act(() => {
        result.current.deleteNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node).toBeUndefined()
      expect(todoNodes.current[node.id]).toBeUndefined()

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
      const { result: todoNodes } = renderHook(() => useAtomValue(todoNodesAtom))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutations))

      act(() => {
        todoMutations.current[1]((prevMutations) => ({ ...prevMutations, [parent.id]: 'insert' }))

        result.current.deleteNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node).toBeUndefined()
      expect(todoNodes.current[node.id]).toBeUndefined()

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

      act(() => {
        result.current.deleteNode({ id: node.id, parentId: node.parentId })
      })

      expect(result.current.node).toBeDefined()
      expect(result.current.node?.id).toBe(node.id)

      expect(todoChildren.current.root.length).toBe(1)
      expect(todoChildren.current.root[0]).toBe(node.id)

      expect(todoMutations.current[node.id]).toBeUndefined()
    })
  })

  describe('nestNode', () => {
    test('should nest a todo node at the root', () => {
      const { children, nodes } = setFakeTodoNodes([{}, {}])
      const node = getTodoNodeFromIndexes(nodes, children, 1)
      const prevSibbling = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
  })

  describe('unnestNode', () => {
    test('should not unnest a todo node at the root', () => {
      const { children, nodes } = setFakeTodoNodes([{}])
      const node = getTodoNodeFromIndexes(nodes, children, 0)

      const { result } = renderHook(() => useTodoNode(node.id))
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtom(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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
      const { result: todoChildren } = renderHook(() => useAtomValue(todoChildrenAtom))
      const { result: todoMutations } = renderHook(() => useAtomValue(todoNodeMutations))

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