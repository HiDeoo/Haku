import assert from 'assert'

import faker from '@faker-js/faker'
import { TodoNodeStatus, type TodoNode } from '@prisma/client'
import cuid from 'cuid'

import {
  API_ERROR_TODO_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ALREADY_EXISTS,
  API_ERROR_TODO_NODE_DELETE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_DELETE_PARENT_NODE_CONFLICT,
  API_ERROR_TODO_NODE_DELETE_ROOT_NODE_CONFLICT,
  API_ERROR_TODO_NODE_DELETE_UPDATE_CONFLICT,
  API_ERROR_TODO_NODE_INSERT_CHILD_DELETE_CONFLICT,
  API_ERROR_TODO_NODE_INSERT_CHILD_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_NOTE_HTML_OR_TEXT_MISSING,
  API_ERROR_TODO_NODE_ROOT_NODE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ROOT_NODE_EMPTY,
  API_ERROR_TODO_NODE_UPDATE_CHILD_DELETE_CONFLICT,
  API_ERROR_TODO_NODE_UPDATE_CHILD_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_UPDATE_DOES_NOT_EXIST,
} from 'constants/error'
import { isDateAfter } from 'libs/date'
import { type TodoNodeData } from 'libs/db/todoNodes'
import { type InferMutationInput } from 'libs/trpc'
import { getTestUser, testApiRoute } from 'tests/api'
import {
  createTestTodo,
  createTestTodoNode,
  getTestTodo,
  getTestTodoNode,
  updateTestTodoNodeChildren,
  updateTestTodoRoot,
} from 'tests/api/db'

const baseMutation: InferMutationInput<'todo.node.update'>['mutations'] = {
  delete: [],
  insert: {},
  update: {},
}

describe('todo.node', () => {
  describe('byId', () => {
    test('should return the name of the todo', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, name } = await createTestTodo()

        const res = await caller.query('todo.node.byId', { id })

        expect(res.name).toBe(name)
      }))

    test('should return the single todo node of a new todo', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, nodes, root } = await createTestTodo()

        const res = await caller.query('todo.node.byId', { id })

        expect(res.children.root.length).toBe(1)
        expect(res.children.root[0]).toBe(root[0])

        assert(root[0])

        expect(Object.keys(res.nodes).length).toBe(1)
        expect(res.nodes[root[0]]?.id).toBe(nodes[0]?.id)
        expect(res.nodes[root[0]]?.parentId).toBeUndefined()
      }))

    test('should return only required todo node fields', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, root } = await createTestTodo()

        const content = 'todo node content'
        const collapsed = true
        const noteHtml = '<p>todo node note</p>'
        const noteText = 'todo node note\n\n'
        const status = TodoNodeStatus.COMPLETED

        const node = await createTestTodoNode({ todoId: id, collapsed, content, noteHtml, noteText, status })
        await updateTestTodoRoot(id, [...root, node.id])

        const res = await caller.query('todo.node.byId', { id })

        expect(res.nodes[node.id]?.id).toBe(node.id)
        expect(res.nodes[node.id]?.parentId).toBeUndefined()
        expect(res.nodes[node.id]?.collapsed).toBe(collapsed)
        expect(res.nodes[node.id]?.content).toBe(content)
        expect(res.nodes[node.id]?.noteHtml).toBe(noteHtml)
        expect(res.nodes[node.id]?.noteText).toBe(noteText)
        expect(res.nodes[node.id]?.status).toBe(status)
      }))

    test('should only return todo nodes of a specific todo', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, nodes, root } = await createTestTodo()

        const { id: otherTodoId } = await createTestTodo()
        await createTestTodoNode({ todoId: otherTodoId })

        const res = await caller.query('todo.node.byId', { id })

        expect(res.children.root.length).toBe(1)
        expect(res.children.root[0]).toBe(root[0])

        assert(root[0])

        expect(Object.keys(res.nodes).length).toBe(1)
        expect(res.nodes[root[0]]?.id).toBe(nodes[0]?.id)
        expect(res.nodes[root[0]]?.parentId).toBeUndefined()
      }))

    test('should return nested todo nodes', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, nodes } = await createTestTodo()

        /**
         * node_0
         * |__ node_0_0
         * |__ node_0_1
         *     |__ node_0_1_0
         *     |__ node_0_1_1
         * |__ node_0_2
         * node_1
         * node_2
         */

        const node_0 = nodes[0]

        assert(node_0)

        const node_0_1_0 = await createTestTodoNode({ todoId: id })
        const node_0_1_1 = await createTestTodoNode({ todoId: id })

        const node_0_0 = await createTestTodoNode({ todoId: id })
        const node_0_1 = await createTestTodoNode({ todoId: id, children: [node_0_1_0.id, node_0_1_1.id] })
        const node_0_2 = await createTestTodoNode({ todoId: id })

        node_0.children = [node_0_0.id, node_0_1.id, node_0_2.id]
        await updateTestTodoNodeChildren(node_0.id, node_0.children)

        const node_1 = await createTestTodoNode({ todoId: id })
        const node_2 = await createTestTodoNode({ todoId: id })

        await updateTestTodoRoot(id, [node_0.id, node_1.id, node_2.id])

        const res = await caller.query('todo.node.byId', { id })

        expect(res.children.root.length).toBe(3)
        expect(res.children.root[0]).toBe(node_0.id)
        expect(res.children.root[1]).toBe(node_1.id)
        expect(res.children.root[2]).toBe(node_2.id)

        expect(Object.keys(res.nodes).length).toBe(8)

        function isEqualTodoNode(todoNodeAId: TodoNodeData['id'], todoNodeB: TodoNode) {
          const todoNodeA = res.nodes[todoNodeAId]
          const todoNodeAChildren = res.children[todoNodeAId]

          return (
            todoNodeA &&
            todoNodeB &&
            todoNodeA.id === todoNodeB.id &&
            todoNodeA.collapsed === todoNodeB.collapsed &&
            todoNodeA.content === todoNodeB.content &&
            todoNodeA.noteHtml === todoNodeB.noteHtml &&
            todoNodeA.noteText === todoNodeB.noteText &&
            todoNodeA.status === todoNodeB.status &&
            todoNodeAChildren?.length === todoNodeB.children.length &&
            todoNodeAChildren?.every((child, index) => child === todoNodeB.children[index])
          )
        }

        expect(isEqualTodoNode(node_0_1_0.id, node_0_1_0)).toBe(true)
        expect(res.nodes[node_0_1_0.id]?.parentId).toBe(node_0_1.id)

        expect(isEqualTodoNode(node_0_1_1.id, node_0_1_1)).toBe(true)
        expect(res.nodes[node_0_1_1.id]?.parentId).toBe(node_0_1.id)

        expect(isEqualTodoNode(node_0_0.id, node_0_0)).toBe(true)
        expect(res.nodes[node_0_0.id]?.parentId).toBe(node_0.id)

        expect(isEqualTodoNode(node_0_1.id, node_0_1)).toBe(true)
        expect(res.nodes[node_0_1.id]?.parentId).toBe(node_0.id)

        expect(isEqualTodoNode(node_0_2.id, node_0_2)).toBe(true)
        expect(res.nodes[node_0_2.id]?.parentId).toBe(node_0.id)

        expect(isEqualTodoNode(node_0.id, node_0)).toBe(true)
        expect(res.nodes[node_0.id]?.parentId).toBeUndefined()

        expect(isEqualTodoNode(node_1.id, node_1)).toBe(true)
        expect(res.nodes[node_0.id]?.parentId).toBeUndefined()

        expect(isEqualTodoNode(node_2.id, node_2)).toBe(true)
        expect(res.nodes[node_0.id]?.parentId).toBeUndefined()
      }))

    test('should return only todo nodes for a todo owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestTodo({ userId: getTestUser('1').userId })

        await expect(() => caller.query('todo.node.byId', { id })).rejects.toThrow(API_ERROR_TODO_DOES_NOT_EXIST)
      }))
  })

  describe('update', () => {
    test('should not mutate todo nodes not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, root } = await createTestTodo({ userId: getTestUser('1').userId })

        const { id: nodeId } = await createTestTodoNode({ todoId: id })

        await expect(() =>
          caller.mutation('todo.node.update', { id, children: { root: [...root, nodeId] }, mutations: baseMutation })
        ).rejects.toThrow(API_ERROR_TODO_DOES_NOT_EXIST)
      }))

    test('should add a previously known node to the root nodes after the default one', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, root } = await createTestTodo()

        const { id: nodeId } = await createTestTodoNode({ todoId: id })

        await caller.mutation('todo.node.update', {
          id,
          children: { root: [...root, nodeId] },
          mutations: baseMutation,
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        expect(testTodo?.root.length).toBe(2)

        expect(testTodo?.root[0]).toBe(root[0])

        expect(testTodo?.root[1]).toBe(nodeId)
      }))

    test('should add a previously known node to the root nodes before the default one', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, root } = await createTestTodo()

        const { id: nodeId } = await createTestTodoNode({ todoId: id })

        await caller.mutation('todo.node.update', {
          id,
          children: { root: [nodeId, ...root] },
          mutations: baseMutation,
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        expect(testTodo?.root.length).toBe(2)

        expect(testTodo?.root[0]).toBe(nodeId)

        expect(testTodo?.root[1]).toBe(root[0])
      }))

    test('should replace the root nodes by previously known ones', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt } = await createTestTodo()

        const { id: nodeId } = await createTestTodoNode({ todoId: id })

        await caller.mutation('todo.node.update', {
          id,
          children: { root: [nodeId] },
          mutations: baseMutation,
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        expect(testTodo?.root.length).toBe(1)

        expect(testTodo?.root[0]).toBe(nodeId)
      }))

    test('should replace the root nodes by new ones', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt } = await createTestTodo()

        const newTodoNode = getFakeTodoNode()

        await caller.mutation('todo.node.update', {
          id,
          children: { root: [newTodoNode.id] },
          mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        expect(testTodo?.root.length).toBe(1)

        expect(testTodo?.root[0]).toBe(newTodoNode.id)
      }))

    test('should not update the root nodes with an unknown node', async () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestTodo()

        const { id: nodeId } = await createTestTodoNode()

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root: [nodeId] },
            mutations: baseMutation,
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_ROOT_NODE_DOES_NOT_EXIST)
      }))

    test('should not update the note HTML of a node if the note text is missing', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, nodes, root } = await createTestTodo()

        const updatedTodoNode = nodes[0]

        assert(updatedTodoNode)

        updatedTodoNode.noteHtml = '<p>updated todo node note HTML</p>'
        updatedTodoNode.noteText = null

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root },
            mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_NOTE_HTML_OR_TEXT_MISSING)
      }))

    test('should not insert a node with a note text if the note HTML is missing', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, root } = await createTestTodo()

        const newTodoNode = getFakeTodoNode({ noteText: 'todo node note text\n\n' })
        newTodoNode.noteHtml = null

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root },
            mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_NOTE_HTML_OR_TEXT_MISSING)
      }))

    test('should insert a new todo node', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, root } = await createTestTodo()

        const newTodoNode = getFakeTodoNode()

        await caller.mutation('todo.node.update', {
          id,
          children: { root },
          mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        expect(testTodo?.nodes.length).toBe(2)

        const testTodoNode = await getTestTodoNode(newTodoNode.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.todoId).toBe(id)
        expect(testTodoNode?.collapsed).toBe(newTodoNode.collapsed)
        expect(testTodoNode?.content).toBe(newTodoNode.content)
        expect(testTodoNode?.noteHtml).toBe(newTodoNode.noteHtml)
        expect(testTodoNode?.noteText).toBe(newTodoNode.noteText)
        expect(testTodoNode?.status).toBe(newTodoNode.status)
      }))

    test('should insert a new todo node with a previously knwown child', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, root } = await createTestTodo()

        const newTodoNodeChildId = root[0]

        assert(newTodoNodeChildId)

        const newTodoNode = getFakeTodoNode()

        await caller.mutation('todo.node.update', {
          id,
          children: { root, [newTodoNode.id]: [newTodoNodeChildId] },
          mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        const testTodoNode = await getTestTodoNode(newTodoNode.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.children.length).toBe(1)
        expect(testTodoNode?.children[0]).toBe(newTodoNodeChildId)
      }))

    test('should insert a new todo node with a previously unknwown child', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, root } = await createTestTodo()

        const newTodoNode = getFakeTodoNode()
        const newTodoNodeChild = getFakeTodoNode()

        await caller.mutation('todo.node.update', {
          id,
          children: { root, [newTodoNode.id]: [newTodoNodeChild.id] },
          mutations: {
            ...baseMutation,
            insert: { [newTodoNode.id]: newTodoNode, [newTodoNodeChild.id]: newTodoNodeChild },
          },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        const testTodoNode = await getTestTodoNode(newTodoNode.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.children.length).toBe(1)
        expect(testTodoNode?.children[0]).toBe(newTodoNodeChild.id)
      }))

    test('should insert nested todo nodes', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, nodes, root } = await createTestTodo()

        const newTodoNode_0 = getFakeTodoNode()
        const newTodoNode_0_0 = getFakeTodoNode()

        const rootNode = nodes[0]

        assert(rootNode)

        const rootNode_children = [...rootNode.children, newTodoNode_0.id]
        const newTodoNode_0_children = [newTodoNode_0_0.id]

        await caller.mutation('todo.node.update', {
          id,
          children: { root, [newTodoNode_0.id]: newTodoNode_0_children, [rootNode.id]: rootNode_children },
          mutations: {
            ...baseMutation,
            insert: { [newTodoNode_0.id]: newTodoNode_0, [newTodoNode_0_0.id]: newTodoNode_0_0 },
            update: { [rootNode.id]: { ...rootNode } },
          },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        expect(testTodo?.nodes.length).toBe(3)

        const testTodoNode_0 = await getTestTodoNode(newTodoNode_0.id)

        expect(testTodoNode_0).toBeDefined()
        expect(testTodoNode_0?.todoId).toBe(id)
        expect(testTodoNode_0?.collapsed).toBe(newTodoNode_0.collapsed)
        expect(testTodoNode_0?.content).toBe(newTodoNode_0.content)
        expect(testTodoNode_0?.noteHtml).toBe(newTodoNode_0.noteHtml)
        expect(testTodoNode_0?.noteText).toBe(newTodoNode_0.noteText)
        expect(testTodoNode_0?.status).toBe(newTodoNode_0.status)
        expect(testTodoNode_0?.children).toEqual(newTodoNode_0_children)

        const testTodoNode_0_0 = await getTestTodoNode(newTodoNode_0_0.id)

        expect(testTodoNode_0_0).toBeDefined()
        expect(testTodoNode_0_0?.todoId).toBe(id)
        expect(testTodoNode_0_0?.collapsed).toBe(newTodoNode_0_0.collapsed)
        expect(testTodoNode_0_0?.content).toBe(newTodoNode_0_0.content)
        expect(testTodoNode_0_0?.noteHtml).toBe(newTodoNode_0_0.noteHtml)
        expect(testTodoNode_0_0?.noteText).toBe(newTodoNode_0_0.noteText)
        expect(testTodoNode_0_0?.status).toBe(newTodoNode_0_0.status)
        expect(testTodoNode_0_0?.children).toEqual([])

        const testRootTodoNode = await getTestTodoNode(rootNode.id)

        expect(testRootTodoNode?.children).toEqual(rootNode_children)
      }))

    test('should insert a new todo node as children of a root node', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, nodes, root } = await createTestTodo()

        const newTodoNode = getFakeTodoNode()

        const rootNode = nodes[0]

        assert(rootNode)

        await caller.mutation('todo.node.update', {
          id,
          children: { root, [rootNode.id]: [...rootNode.children, newTodoNode.id] },
          mutations: {
            ...baseMutation,
            insert: { [newTodoNode.id]: newTodoNode },
            update: { [rootNode.id]: { ...rootNode } },
          },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        expect(testTodo?.nodes.length).toBe(2)

        const testTodoNode = await getTestTodoNode(newTodoNode.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.todoId).toBe(id)
        expect(testTodoNode?.collapsed).toBe(newTodoNode.collapsed)
        expect(testTodoNode?.content).toBe(newTodoNode.content)
        expect(testTodoNode?.noteHtml).toBe(newTodoNode.noteHtml)
        expect(testTodoNode?.noteText).toBe(newTodoNode.noteText)
        expect(testTodoNode?.status).toBe(newTodoNode.status)

        const testRootTodoNode = await getTestTodoNode(rootNode.id)

        expect(testRootTodoNode?.children.length).toBe(1)
        expect(testRootTodoNode?.children[0]).toBe(newTodoNode.id)
      }))

    test('should not insert multiple todo nodes with the same ID', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, nodes, root } = await createTestTodo()

        const newTodoNode = getFakeTodoNode({ id: nodes[0]?.id })

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root },
            mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_ALREADY_EXISTS)
      }))

    test('should not insert a new todo node with a nonexisting child', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, root } = await createTestTodo()

        const newTodoNode = getFakeTodoNode()

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root, [newTodoNode.id]: ['nonexistingChildId'] },
            mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_INSERT_CHILD_DOES_NOT_EXIST)
      }))

    test('should not insert a new todo node with a deleted child', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, root } = await createTestTodo()

        const deletedTodoNode = await createTestTodoNode({ todoId: id })

        const newTodoNode = getFakeTodoNode()

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root, [newTodoNode.id]: [deletedTodoNode.id] },
            mutations: {
              ...baseMutation,
              insert: { [newTodoNode.id]: newTodoNode },
              delete: [deletedTodoNode.id],
            },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_INSERT_CHILD_DELETE_CONFLICT)
      }))

    test('should update an existing todo node', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, nodes, root } = await createTestTodo()

        const updatedTodoNodeId = nodes[0]?.id

        assert(updatedTodoNodeId)

        const newCollapsed = !nodes[0]?.collapsed
        const newContent = 'updated todo node'
        const newNote = 'updated todo node note'
        const newStatus =
          nodes[0]?.status !== TodoNodeStatus.COMPLETED ? TodoNodeStatus.COMPLETED : TodoNodeStatus.ACTIVE
        const updatedTodoNode = getFakeTodoNode({
          id: updatedTodoNodeId,
          collapsed: newCollapsed,
          content: newContent,
          noteHtml: newNote,
          noteText: newNote,
          status: newStatus,
        })

        await caller.mutation('todo.node.update', {
          id,
          children: { root },
          mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        expect(testTodo?.nodes.length).toBe(1)

        const testTodoNode = await getTestTodoNode(updatedTodoNodeId)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.todoId).toBe(id)
        expect(testTodoNode?.collapsed).toBe(newCollapsed)
        expect(testTodoNode?.content).toBe(newContent)
        expect(testTodoNode?.noteHtml).toBe(newNote)
        expect(testTodoNode?.noteText).toBe(newNote)
        expect(testTodoNode?.status).toBe(newStatus)
      }))

    test('should update an existing todo node children with a previously knwow child', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, nodes, root } = await createTestTodo()
        const childTodoNode = await createTestTodoNode({ todoId: id })

        const updatedTodoNodeId = nodes[0]?.id

        assert(updatedTodoNodeId)

        const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })

        await caller.mutation('todo.node.update', {
          id,
          children: { root, [updatedTodoNode.id]: [childTodoNode.id] },
          mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        const testTodoNode = await getTestTodoNode(updatedTodoNodeId)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.children.length).toBe(1)
        expect(testTodoNode?.children[0]).toBe(childTodoNode.id)
      }))

    test('should update an existing todo node children with a previously unknwown child', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, nodes, root } = await createTestTodo()

        const updatedTodoNodeId = nodes[0]?.id

        assert(updatedTodoNodeId)

        const childTodoNode = getFakeTodoNode()

        const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })

        await caller.mutation('todo.node.update', {
          id,
          children: { root, [updatedTodoNode.id]: [childTodoNode.id] },
          mutations: {
            ...baseMutation,
            update: { [updatedTodoNode.id]: updatedTodoNode },
            insert: { [childTodoNode.id]: childTodoNode },
          },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        const testTodoNode = await getTestTodoNode(updatedTodoNodeId)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.children.length).toBe(1)
        expect(testTodoNode?.children[0]).toBe(childTodoNode.id)
      }))

    test('should update an existing todo node children order', async () =>
      testApiRoute(async ({ caller }) => {
        const todoNode_0 = await createTestTodoNode(getFakeTodoNode())
        const todoNode_1 = await createTestTodoNode(getFakeTodoNode())

        const { id, modifiedAt, nodes, root } = await createTestTodo({}, [todoNode_0.id, todoNode_1.id])

        const updatedTodoNode = nodes[0]

        assert(updatedTodoNode)

        await caller.mutation('todo.node.update', {
          id,
          children: { root, [updatedTodoNode.id]: [todoNode_1.id, todoNode_0.id] },
          mutations: {
            ...baseMutation,
            update: { [updatedTodoNode.id]: { ...updatedTodoNode } },
          },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        const testTodoNode = await getTestTodoNode(updatedTodoNode.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.todoId).toBe(id)

        expect(testTodoNode?.children[0]).toBe(todoNode_1.id)

        expect(testTodoNode?.children[1]).toBe(todoNode_0.id)
      }))

    test('should not update a nonexisting todo node', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, root } = await createTestTodo()

        const updatedTodoNode = getFakeTodoNode({ id: cuid(), content: 'updated todo node' })

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root },
            mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_UPDATE_DOES_NOT_EXIST)
      }))

    test('should not update a todo node with a nonexisting child', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, nodes, root } = await createTestTodo()

        const updatedTodoNodeId = nodes[0]?.id

        assert(updatedTodoNodeId)

        const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root, [updatedTodoNode.id]: ['nonexistingChildId'] },
            mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_UPDATE_CHILD_DOES_NOT_EXIST)
      }))

    test('should not update a todo node with a deleted child', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, nodes, root } = await createTestTodo()

        const deletedTodoNode = await createTestTodoNode({ todoId: id })

        const updatedTodoNodeId = nodes[0]?.id

        assert(updatedTodoNodeId)

        const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root, [updatedTodoNode.id]: [deletedTodoNode.id] },
            mutations: {
              ...baseMutation,
              update: { [updatedTodoNode.id]: updatedTodoNode },
              delete: [deletedTodoNode.id],
            },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_UPDATE_CHILD_DELETE_CONFLICT)
      }))

    test('should delete a nested todo node', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, root } = await createTestTodo()

        const deletedTodoNode = await createTestTodoNode({ todoId: id })

        await caller.mutation('todo.node.update', {
          id,
          children: { root },
          mutations: { ...baseMutation, delete: [deletedTodoNode.id] },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        const testTodoNode = await getTestTodoNode(deletedTodoNode.id)

        expect(testTodoNode).toBeNull()
      }))

    test('should delete a root todo node', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, nodes } = await createTestTodo()

        const deletedTodoNode = await createTestTodoNode({ todoId: id })

        const rootNode = nodes[0]

        assert(rootNode)

        await updateTestTodoRoot(id, [deletedTodoNode.id])

        await caller.mutation('todo.node.update', {
          id,
          children: { root: [rootNode.id] },
          mutations: {
            ...baseMutation,
            delete: [deletedTodoNode.id],
          },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        const testTodoNode = await getTestTodoNode(deletedTodoNode.id)

        expect(testTodoNode).toBeNull()
      }))

    test('should delete nested todo nodes', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, root, nodes } = await createTestTodo()

        const todoNode_0_0_0 = await createTestTodoNode({ todoId: id })
        const todoNode_0_0_1 = await createTestTodoNode({ todoId: id })
        const todoNode_0_0 = await createTestTodoNode({
          todoId: id,
          children: [todoNode_0_0_0.id, todoNode_0_0_1.id],
        })
        const todoNode_0 = await createTestTodoNode({ todoId: id, children: [todoNode_0_0.id] })

        const rootNode = nodes[0]

        assert(rootNode)

        await updateTestTodoNodeChildren(rootNode.id, [todoNode_0.id])

        await caller.mutation('todo.node.update', {
          id,
          children: { root, [rootNode.id]: [] },
          mutations: {
            ...baseMutation,
            delete: [todoNode_0.id],
            update: { [rootNode.id]: { ...rootNode } },
          },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        expect(testTodo?.nodes.length).toBe(1)

        const testRootTodoNode = await getTestTodo(rootNode.id)
        expect(testRootTodoNode).toBeDefined()

        const testTodoNode_0 = await getTestTodo(todoNode_0.id)
        expect(testTodoNode_0).toBe(null)

        const testTodoNode_0_0 = await getTestTodo(todoNode_0_0.id)
        expect(testTodoNode_0_0).toBe(null)

        const testTodoNode_0_0_0 = await getTestTodo(todoNode_0_0_0.id)
        expect(testTodoNode_0_0_0).toBe(null)

        const testTodoNode_0_0_1 = await getTestTodo(todoNode_0_0_1.id)
        expect(testTodoNode_0_0_1).toBe(null)
      }))

    test('should not delete all root todo nodes', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, nodes } = await createTestTodo()

        const deletedRootNode = nodes[0]

        assert(deletedRootNode)

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root: [] },
            mutations: {
              ...baseMutation,
              delete: [deletedRootNode.id],
            },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_ROOT_NODE_EMPTY)
      }))

    test('should not delete a nested todo nodes still referenced by its parent', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, root, nodes } = await createTestTodo()

        const todoNode_0 = await createTestTodoNode({ todoId: id })

        const rootNode = nodes[0]

        assert(rootNode)

        await updateTestTodoNodeChildren(rootNode.id, [todoNode_0.id])

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root },
            mutations: { ...baseMutation, delete: [todoNode_0.id] },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_DELETE_PARENT_NODE_CONFLICT)
      }))

    test('should not delete a todo node set as root node', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, root } = await createTestTodo()

        const deletedTodoNodeId = root[0]

        assert(deletedTodoNodeId)

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root },
            mutations: { ...baseMutation, delete: [deletedTodoNodeId] },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_DELETE_ROOT_NODE_CONFLICT)
      }))

    test('should not delete a nonexisting todo node', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, nodes, root } = await createTestTodo()

        const deletedTodoNodeId = nodes[0]?.id

        assert(deletedTodoNodeId)

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root },
            mutations: { ...baseMutation, delete: ['nonexistingTodoNodeId'] },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_DELETE_DOES_NOT_EXIST)
      }))

    test('should not delete an updated todo node', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, nodes, root } = await createTestTodo()

        const deletedTodoNode = nodes[0]

        assert(deletedTodoNode)

        await expect(() =>
          caller.mutation('todo.node.update', {
            id,
            children: { root },
            mutations: {
              ...baseMutation,
              delete: [deletedTodoNode.id],
              update: { [deletedTodoNode.id]: deletedTodoNode },
            },
          })
        ).rejects.toThrow(API_ERROR_TODO_NODE_DELETE_UPDATE_CONFLICT)
      }))

    test('should properly mutate various todo nodes', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, nodes } = await createTestTodo()

        /**
         * Before:
         *
         * [ ] node_0
         * |__ [X] node_0_0                       <- note added
         * |__ [ ] node_0_1                       <- deleted
         *     |__ [X] node_0_1_0
         *     |__ [ ] node_0_1_1
         *         |__ [X] node_0_1_1_0
         *     |__ [ ] node_0_1_2
         * |__ [ ] node_0_2
         * |__ [~] node_0_3                       <- moved to root node 2nd child - marked as active
         * [ ] node_1                             <- moved to node_0 first child
         * |__ [ ] node_1_0                       <- marked as completed & collapsed
         *     |__ [ ] node_1_0_0                 <- renamed to node_1_0_0_updated - marked as completed
         * [X] node_2                             <- marked as not completed
         * [ ] node_3 (collapsed)                 <- moved before node_2 and mark as not collapsed
         *     node_3_note                        <- note deleted
         * [X] node_4                             <- marked as cancelled
         */

        const node_0 = nodes[0]

        assert(node_0)

        const node_0_1_1_0 = await createTestTodoNode({
          todoId: id,
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.COMPLETED,
        })

        const node_0_1_0 = await createTestTodoNode({
          todoId: id,
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.COMPLETED,
        })
        const node_0_1_1 = await createTestTodoNode({
          todoId: id,
          children: [node_0_1_1_0.id],
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.ACTIVE,
        })
        const node_0_1_2 = await createTestTodoNode({
          todoId: id,
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.ACTIVE,
        })

        const node_0_0 = await createTestTodoNode({
          todoId: id,
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.COMPLETED,
        })
        const node_0_1 = await createTestTodoNode({
          todoId: id,
          children: [node_0_1_0.id, node_0_1_1.id, node_0_1_2.id],
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.ACTIVE,
        })
        const node_0_2 = await createTestTodoNode({
          todoId: id,
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.ACTIVE,
        })
        const node_0_3 = await createTestTodoNode({
          todoId: id,
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.CANCELLED,
        })

        await updateTestTodoNodeChildren(node_0.id, [node_0_0.id, node_0_1.id, node_0_2.id, node_0_3.id])

        const node_1_0_0 = await createTestTodoNode({
          todoId: id,
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.ACTIVE,
        })

        const node_1_0 = await createTestTodoNode({
          todoId: id,
          children: [node_1_0_0.id],
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.ACTIVE,
        })

        const node_1 = await createTestTodoNode({
          todoId: id,
          children: [node_1_0.id],
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.ACTIVE,
        })
        const node_2 = await createTestTodoNode({
          todoId: id,
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.COMPLETED,
        })
        const node_3 = await createTestTodoNode({
          todoId: id,
          collapsed: true,
          noteHtml: 'node_3_note',
          noteText: 'node_3_note',
          status: TodoNodeStatus.ACTIVE,
        })
        const node_4 = await createTestTodoNode({
          todoId: id,
          collapsed: true,
          noteHtml: 'node_4_note',
          noteText: 'node_4_note',
          status: TodoNodeStatus.COMPLETED,
        })

        await updateTestTodoRoot(id, [node_0.id, node_1.id, node_2.id, node_3.id, node_4.id])

        /**
         * After:
         *
         * [ ] node_0
         * |__ [ ] node_1
         *     |__ [X] node_1_0
         *         |__ [X] node_1_0_0_updated
         * |__ [X] node_0_0
         *         node_0_0_note
         *     |__ [ ] node_0_0_0_inserted
         * |__ [ ] node_0_2
         * [ ] node_0_3
         * [ ] node_3
         * [ ] node_2
         * [-] node_4
         */

        const node_1_0_new_status = TodoNodeStatus.COMPLETED
        const node_1_0_new_collapsed = true
        const node_1_0_0_new_status = TodoNodeStatus.COMPLETED
        const node_1_0_0_new_name = 'node_1_0_0_updated'
        const node_0_0_0_inserted = getFakeTodoNode()
        const node_0_0_new_note = 'node_0_0_note'
        const node_0_3_new_status = TodoNodeStatus.ACTIVE
        const node_2_new_status = TodoNodeStatus.ACTIVE
        const node_3_new_note = ''
        const node_3_new_collapsed = false
        const node_4_new_status = TodoNodeStatus.CANCELLED

        await caller.mutation('todo.node.update', {
          id,
          children: {
            root: [node_0.id, node_0_3.id, node_3.id, node_2.id],
            [node_0.id]: [node_1.id, node_0_0.id, node_0_2.id],
            [node_0_0.id]: [node_0_0_0_inserted.id],
          },
          mutations: {
            ...baseMutation,
            delete: [node_0_1.id],
            update: {
              [node_2.id]: { ...node_2, status: node_2_new_status },
              [node_1_0_0.id]: { ...node_1_0_0, content: node_1_0_0_new_name, status: node_1_0_0_new_status },
              [node_1_0.id]: { ...node_1_0, collapsed: node_1_0_new_collapsed, status: node_1_0_new_status },
              [node_0.id]: { ...node_0 },
              [node_0_0.id]: { ...node_0_0, noteHtml: node_0_0_new_note, noteText: node_0_0_new_note },
              [node_0_3.id]: { ...node_0_3, status: node_0_3_new_status },
              [node_3.id]: {
                ...node_3,
                collapsed: node_3_new_collapsed,
                noteHtml: node_3_new_note,
                noteText: node_3_new_note,
              },
              [node_4.id]: { ...node_4, status: node_4_new_status },
            },
            insert: {
              [node_0_0_0_inserted.id]: node_0_0_0_inserted,
            },
          },
        })

        const testTodo = await getTestTodo(id)

        expect(isDateAfter(testTodo?.modifiedAt, modifiedAt)).toBe(true)

        expect(testTodo?.nodes.length).toBe(11)

        expect(testTodo?.root.length).toBe(4)
        expect(testTodo?.root[0]).toBe(node_0.id)
        expect(testTodo?.root[1]).toBe(node_0_3.id)
        expect(testTodo?.root[2]).toBe(node_3.id)
        expect(testTodo?.root[3]).toBe(node_2.id)

        let testTodoNode = await getTestTodoNode(node_0.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.children.length).toBe(3)
        expect(testTodoNode?.children[0]).toBe(node_1.id)
        expect(testTodoNode?.children[1]).toBe(node_0_0.id)
        expect(testTodoNode?.children[2]).toBe(node_0_2.id)

        testTodoNode = await getTestTodoNode(node_1.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.children.length).toBe(1)
        expect(testTodoNode?.children[0]).toBe(node_1_0.id)

        testTodoNode = await getTestTodoNode(node_1_0.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.collapsed).toBe(node_1_0_new_collapsed)
        expect(testTodoNode?.status).toBe(node_1_0_new_status)
        expect(testTodoNode?.children.length).toBe(1)
        expect(testTodoNode?.children[0]).toBe(node_1_0_0.id)

        testTodoNode = await getTestTodoNode(node_1_0_0.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.children.length).toBe(0)
        expect(testTodoNode?.content).toBe(node_1_0_0_new_name)
        expect(testTodoNode?.status).toBe(node_1_0_new_status)

        testTodoNode = await getTestTodoNode(node_0_0.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.children.length).toBe(1)
        expect(testTodoNode?.children[0]).toBe(node_0_0_0_inserted.id)
        expect(testTodoNode?.noteHtml).toBe(node_0_0_new_note)
        expect(testTodoNode?.noteText).toBe(node_0_0_new_note)

        testTodoNode = await getTestTodoNode(node_0_0_0_inserted.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.children.length).toBe(0)
        expect(testTodoNode?.content).toBe(node_0_0_0_inserted.content)

        testTodoNode = await getTestTodoNode(node_0_2.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.children.length).toBe(0)

        testTodoNode = await getTestTodoNode(node_0_3.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.status).toBe(node_0_3_new_status)
        expect(testTodoNode?.children.length).toBe(0)

        testTodoNode = await getTestTodoNode(node_3.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.children.length).toBe(0)
        expect(testTodoNode?.collapsed).toBe(false)
        expect(testTodoNode?.noteHtml).toBe('')
        expect(testTodoNode?.noteText).toBe('')

        testTodoNode = await getTestTodoNode(node_2.id)

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.status).toBe(node_2_new_status)
        expect(testTodoNode?.children.length).toBe(0)

        testTodoNode = await getTestTodoNode(node_4.id)

        expect(testTodoNode?.children.length).toBe(0)
        expect(testTodoNode?.status).toBe(node_4_new_status)

        const deletedNodeIds = [node_0_1.id, node_0_1_0.id, node_0_1_1.id, node_0_1_1_0.id, node_0_1_2.id]

        for (const deletedNodeId of deletedNodeIds) {
          testTodoNode = await getTestTodoNode(deletedNodeId)

          expect(testTodoNode).toBe(null)
        }
      }))
  })
})

function getFakeTodoNode(options?: Partial<TodoNodeData>): TodoNodeData {
  const data = faker.datatype.boolean() ? faker.lorem.sentences() : null

  return {
    id: options?.id ?? cuid(),
    collapsed: options?.collapsed ?? faker.datatype.boolean(),
    content: options?.content ?? faker.lorem.words(),
    noteHtml: options?.noteHtml ?? data,
    noteText: options?.noteText ?? data,
    status:
      options?.status ??
      faker.helpers.arrayElement([TodoNodeStatus.ACTIVE, TodoNodeStatus.COMPLETED, TodoNodeStatus.CANCELLED]),
  }
}
