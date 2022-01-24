import assert from 'assert'

import faker from '@faker-js/faker'
import { type TodoNode } from '@prisma/client'
import cuid from 'cuid'
import { StatusCode } from 'status-code-enum'

import { getTestUser, testApiRoute } from 'tests/api'
import {
  createTestTodo,
  createTestTodoNode,
  getTestTodo,
  getTestTodoNode,
  updateTestTodoNodeChildren,
  updateTestTodoRoot,
} from 'tests/api/db'
import { HttpMethod } from 'libs/http'
import idHandler, { type UpdateTodoNodesBody } from 'pages/api/todos/[id]/nodes'
import { type TodoNodesData, type TodoNodeData } from 'libs/db/todoNodes'
import {
  API_ERROR_TODO_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ALREADY_EXISTS,
  API_ERROR_TODO_NODE_DELETE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_DELETE_PARENT_NODE_CONFLICT,
  API_ERROR_TODO_NODE_DELETE_ROOT_NODE_CONFLICT,
  API_ERROR_TODO_NODE_DELETE_UPDATE_CONFLICT,
  API_ERROR_TODO_NODE_INSERT_CHILD_DELETE_CONFLICT,
  API_ERROR_TODO_NODE_INSERT_CHILD_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ROOT_NODE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ROOT_NODE_EMPTY,
  API_ERROR_TODO_NODE_UPDATE_CHILD_DELETE_CONFLICT,
  API_ERROR_TODO_NODE_UPDATE_CHILD_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_UPDATE_DOES_NOT_EXIST,
  type ApiErrorResponse,
} from 'libs/api/routes/errors'

const baseMutation: UpdateTodoNodesBody['mutations'] = {
  delete: [],
  insert: {},
  update: {},
}

describe('todo nodes', () => {
  describe('GET', () => {
    test('should return the single todo node of a new todo', async () => {
      const { id, nodes, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoNodesData>()

          expect(json.children.root.length).toBe(1)
          expect(json.children.root[0]).toBe(root[0])

          assert(root[0])

          expect(Object.keys(json.nodes).length).toBe(1)
          expect(json.nodes[root[0]]?.id).toBe(nodes[0]?.id)
          expect(json.nodes[root[0]]?.parentId).toBeUndefined()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should only return todo nodes of a specific todo', async () => {
      const { id, nodes, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: otherTodoId } = await createTestTodo()
          await createTestTodoNode({ todoId: otherTodoId })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoNodesData>()

          expect(json.children.root.length).toBe(1)
          expect(json.children.root[0]).toBe(root[0])

          assert(root[0])

          expect(Object.keys(json.nodes).length).toBe(1)
          expect(json.nodes[root[0]]?.id).toBe(nodes[0]?.id)
          expect(json.nodes[root[0]]?.parentId).toBeUndefined()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should return nested todo nodes', async () => {
      const { id, nodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
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

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoNodesData>()

          expect(json.children.root.length).toBe(3)
          expect(json.children.root[0]).toBe(node_0.id)
          expect(json.children.root[1]).toBe(node_1.id)
          expect(json.children.root[2]).toBe(node_2.id)

          expect(Object.keys(json.nodes).length).toBe(8)

          function isEqualTodoNode(todoNodeAId: TodoNodeData['id'], todoNodeB: TodoNode) {
            const todoNodeA = json.nodes[todoNodeAId]
            const todoNodeAChildren = json.children[todoNodeAId]

            return (
              todoNodeA &&
              todoNodeB &&
              todoNodeA.id === todoNodeB.id &&
              todoNodeA.content === todoNodeB.content &&
              todoNodeAChildren?.length === todoNodeB.children.length &&
              todoNodeAChildren?.every((child, index) => child === todoNodeB.children[index])
            )
          }

          expect(isEqualTodoNode(node_0_1_0.id, node_0_1_0)).toBe(true)
          expect(json.nodes[node_0_1_0.id]?.parentId).toBe(node_0_1.id)

          expect(isEqualTodoNode(node_0_1_1.id, node_0_1_1)).toBe(true)
          expect(json.nodes[node_0_1_1.id]?.parentId).toBe(node_0_1.id)

          expect(isEqualTodoNode(node_0_0.id, node_0_0)).toBe(true)
          expect(json.nodes[node_0_0.id]?.parentId).toBe(node_0.id)

          expect(isEqualTodoNode(node_0_1.id, node_0_1)).toBe(true)
          expect(json.nodes[node_0_1.id]?.parentId).toBe(node_0.id)

          expect(isEqualTodoNode(node_0_2.id, node_0_2)).toBe(true)
          expect(json.nodes[node_0_2.id]?.parentId).toBe(node_0.id)

          expect(isEqualTodoNode(node_0.id, node_0)).toBe(true)
          expect(json.nodes[node_0.id]?.parentId).toBeUndefined()

          expect(isEqualTodoNode(node_1.id, node_1)).toBe(true)
          expect(json.nodes[node_0.id]?.parentId).toBeUndefined()

          expect(isEqualTodoNode(node_2.id, node_2)).toBe(true)
          expect(json.nodes[node_0.id]?.parentId).toBeUndefined()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should return only todo nodes for a todo owned by the current user', async () => {
      const { id } = await createTestTodo({ userId: getTestUser('1').userId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_DOES_NOT_EXIST)
        },
        { dynamicRouteParams: { id } }
      )
    })
  })

  describe('PATCH', () => {
    test('should not mutate todo nodes not owned by the current user', async () => {
      const { id, root } = await createTestTodo({ userId: getTestUser('1').userId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: nodeId } = await createTestTodoNode({ todoId: id })

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ children: { root: [...root, nodeId] }, mutations: baseMutation }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_DOES_NOT_EXIST)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should add a previously known node to the root nodes after the default one', async () => {
      const { id, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: nodeId } = await createTestTodoNode({ todoId: id })

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ children: { root: [...root, nodeId] }, mutations: baseMutation }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.root.length).toBe(2)

          expect(testTodo?.root[0]).toBe(root[0])

          expect(testTodo?.root[1]).toBe(nodeId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should add a previously known node to the root nodes before the default one', async () => {
      const { id, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: nodeId } = await createTestTodoNode({ todoId: id })

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ children: { root: [nodeId, ...root] }, mutations: baseMutation }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.root.length).toBe(2)

          expect(testTodo?.root[0]).toBe(nodeId)

          expect(testTodo?.root[1]).toBe(root[0])
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should replace the root nodes by previously known ones', async () => {
      const { id } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: nodeId } = await createTestTodoNode({ todoId: id })

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ children: { root: [nodeId] }, mutations: baseMutation }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.root.length).toBe(1)

          expect(testTodo?.root[0]).toBe(nodeId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should replace the root nodes by new ones', async () => {
      const { id } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode = getFakeTodoNode()

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root: [newTodoNode.id] },
              mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
            }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.root.length).toBe(1)

          expect(testTodo?.root[0]).toBe(newTodoNode.id)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update the root nodes with an unknown node', async () => {
      const { id } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: nodeId } = await createTestTodoNode()

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ children: { root: [nodeId] }, mutations: baseMutation }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_ROOT_NODE_DOES_NOT_EXIST)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should insert a new todo node', async () => {
      const { id, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode = getFakeTodoNode()

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root },
              mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
            }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.nodes.length).toBe(2)

          const testTodoNode = await getTestTodoNode(newTodoNode.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.todoId).toBe(id)
          expect(testTodoNode?.content).toBe(newTodoNode.content)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should insert a new todo node with a previously knwown child', async () => {
      const { id, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNodeChildId = root[0]

          assert(newTodoNodeChildId)

          const newTodoNode = getFakeTodoNode()

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [newTodoNode.id]: [newTodoNodeChildId] },
              mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
            }),
          })

          const testTodoNode = await getTestTodoNode(newTodoNode.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.children.length).toBe(1)
          expect(testTodoNode?.children[0]).toBe(newTodoNodeChildId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should insert a new todo node with a previously unknwown child', async () => {
      const { id, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode = getFakeTodoNode()
          const newTodoNodeChild = getFakeTodoNode()

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [newTodoNode.id]: [newTodoNodeChild.id] },
              mutations: {
                ...baseMutation,
                insert: { [newTodoNode.id]: newTodoNode, [newTodoNodeChild.id]: newTodoNodeChild },
              },
            }),
          })

          const testTodoNode = await getTestTodoNode(newTodoNode.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.children.length).toBe(1)
          expect(testTodoNode?.children[0]).toBe(newTodoNodeChild.id)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should insert nested todo nodes', async () => {
      const { id, root, nodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode_0 = getFakeTodoNode()
          const newTodoNode_0_0 = getFakeTodoNode()

          const rootNode = nodes[0]

          assert(rootNode)

          const rootNode_children = [...rootNode.children, newTodoNode_0.id]
          const newTodoNode_0_children = [newTodoNode_0_0.id]

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [newTodoNode_0.id]: newTodoNode_0_children, [rootNode.id]: rootNode_children },
              mutations: {
                ...baseMutation,
                insert: { [newTodoNode_0.id]: newTodoNode_0, [newTodoNode_0_0.id]: newTodoNode_0_0 },
                update: { [rootNode.id]: { ...rootNode } },
              },
            }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.nodes.length).toBe(3)

          const testTodoNode_0 = await getTestTodoNode(newTodoNode_0.id)

          expect(testTodoNode_0).toBeDefined()
          expect(testTodoNode_0?.todoId).toBe(id)
          expect(testTodoNode_0?.content).toBe(newTodoNode_0.content)
          expect(testTodoNode_0?.children).toEqual(newTodoNode_0_children)

          const testTodoNode_0_0 = await getTestTodoNode(newTodoNode_0_0.id)

          expect(testTodoNode_0_0).toBeDefined()
          expect(testTodoNode_0_0?.todoId).toBe(id)
          expect(testTodoNode_0_0?.content).toBe(newTodoNode_0_0.content)
          expect(testTodoNode_0_0?.children).toEqual([])

          const testRootTodoNode = await getTestTodoNode(rootNode.id)

          expect(testRootTodoNode?.children).toEqual(rootNode_children)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should insert a new todo node as children of a root node', async () => {
      const { id, root, nodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode = getFakeTodoNode()

          const rootNode = nodes[0]

          assert(rootNode)

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [rootNode.id]: [...rootNode.children, newTodoNode.id] },
              mutations: {
                ...baseMutation,
                insert: { [newTodoNode.id]: newTodoNode },
                update: { [rootNode.id]: { ...rootNode } },
              },
            }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.nodes.length).toBe(2)

          const testTodoNode = await getTestTodoNode(newTodoNode.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.todoId).toBe(id)
          expect(testTodoNode?.content).toBe(newTodoNode.content)

          const testRootTodoNode = await getTestTodoNode(rootNode.id)

          expect(testRootTodoNode?.children.length).toBe(1)
          expect(testRootTodoNode?.children[0]).toBe(newTodoNode.id)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not insert multiple todo nodes with the same ID', async () => {
      const { id, nodes, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode = getFakeTodoNode({ id: nodes[0]?.id })

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root },
              mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_ALREADY_EXISTS)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not insert a new todo node with a nonexisting child', async () => {
      const { id, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode = getFakeTodoNode()

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [newTodoNode.id]: ['nonexistingChildId'] },
              mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_INSERT_CHILD_DOES_NOT_EXIST)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not insert a new todo node with a deleted child', async () => {
      const { id, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNode = await createTestTodoNode({ todoId: id })

          const newTodoNode = getFakeTodoNode()

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [newTodoNode.id]: [deletedTodoNode.id] },
              mutations: {
                ...baseMutation,
                insert: { [newTodoNode.id]: newTodoNode },
                delete: [deletedTodoNode.id],
              },
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_INSERT_CHILD_DELETE_CONFLICT)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should update an existing todo node', async () => {
      const { id, nodes, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const updatedTodoNodeId = nodes[0]?.id

          assert(updatedTodoNodeId)

          const newContent = 'updated todo node'
          const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId, content: newContent })

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root },
              mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
            }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.nodes.length).toBe(1)

          const testTodoNode = await getTestTodoNode(updatedTodoNodeId)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.todoId).toBe(id)
          expect(testTodoNode?.content).toBe(newContent)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should update an existing todo node children with a previously knwow child', async () => {
      const { id, nodes, root } = await createTestTodo()
      const childTodoNode = await createTestTodoNode({ todoId: id })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const updatedTodoNodeId = nodes[0]?.id

          assert(updatedTodoNodeId)

          const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [updatedTodoNode.id]: [childTodoNode.id] },
              mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
            }),
          })

          const testTodoNode = await getTestTodoNode(updatedTodoNodeId)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.children.length).toBe(1)
          expect(testTodoNode?.children[0]).toBe(childTodoNode.id)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should update an existing todo node children with a previously unknwown child', async () => {
      const { id, nodes, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const updatedTodoNodeId = nodes[0]?.id

          assert(updatedTodoNodeId)

          const childTodoNode = getFakeTodoNode()

          const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [updatedTodoNode.id]: [childTodoNode.id] },
              mutations: {
                ...baseMutation,
                update: { [updatedTodoNode.id]: updatedTodoNode },
                insert: { [childTodoNode.id]: childTodoNode },
              },
            }),
          })

          const testTodoNode = await getTestTodoNode(updatedTodoNodeId)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.children.length).toBe(1)
          expect(testTodoNode?.children[0]).toBe(childTodoNode.id)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should update an existing todo node children order', async () => {
      const todoNode_0 = await createTestTodoNode(getFakeTodoNode())
      const todoNode_1 = await createTestTodoNode(getFakeTodoNode())

      const { id, nodes, root } = await createTestTodo({}, [todoNode_0.id, todoNode_1.id])

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const updatedTodoNode = nodes[0]

          assert(updatedTodoNode)

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [updatedTodoNode.id]: [todoNode_1.id, todoNode_0.id] },
              mutations: {
                ...baseMutation,
                update: { [updatedTodoNode.id]: { ...updatedTodoNode } },
              },
            }),
          })

          const testTodoNode = await getTestTodoNode(updatedTodoNode.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.todoId).toBe(id)

          expect(testTodoNode?.children[0]).toBe(todoNode_1.id)

          expect(testTodoNode?.children[1]).toBe(todoNode_0.id)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a nonexisting todo node', async () => {
      const { id, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const updatedTodoNode = getFakeTodoNode({ id: 'nonexistingTodoNodeId', content: 'updated todo node' })

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root },
              mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_UPDATE_DOES_NOT_EXIST)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a todo node with a nonexisting child', async () => {
      const { id, nodes, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const updatedTodoNodeId = nodes[0]?.id

          assert(updatedTodoNodeId)

          const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [updatedTodoNode.id]: ['nonexistingChildId'] },
              mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_UPDATE_CHILD_DOES_NOT_EXIST)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a todo node with a deleted child', async () => {
      const { id, nodes, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNode = await createTestTodoNode({ todoId: id })

          const updatedTodoNodeId = nodes[0]?.id

          assert(updatedTodoNodeId)

          const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [updatedTodoNode.id]: [deletedTodoNode.id] },
              mutations: {
                ...baseMutation,
                update: { [updatedTodoNode.id]: updatedTodoNode },
                delete: [deletedTodoNode.id],
              },
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_UPDATE_CHILD_DELETE_CONFLICT)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should delete a nested todo node', async () => {
      const { id, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNode = await createTestTodoNode({ todoId: id })

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ children: { root }, mutations: { ...baseMutation, delete: [deletedTodoNode.id] } }),
          })

          const testTodoNode = await getTestTodoNode(deletedTodoNode.id)

          expect(testTodoNode).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should delete a root todo node', async () => {
      const { id, nodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNode = await createTestTodoNode({ todoId: id })

          const rootNode = nodes[0]

          assert(rootNode)

          await updateTestTodoRoot(id, [deletedTodoNode.id])

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root: [rootNode.id] },
              mutations: {
                ...baseMutation,
                delete: [deletedTodoNode.id],
              },
            }),
          })

          const testTodoNode = await getTestTodoNode(deletedTodoNode.id)

          expect(testTodoNode).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should delete nested todo nodes', async () => {
      const { id, root, nodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
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

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root, [rootNode.id]: [] },
              mutations: {
                ...baseMutation,
                delete: [todoNode_0.id],
                update: { [rootNode.id]: { ...rootNode } },
              },
            }),
          })

          const testTodo = await getTestTodo(id)

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
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not delete all root todo nodes', async () => {
      const { id, nodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedRootNode = nodes[0]

          assert(deletedRootNode)

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root: [] },
              mutations: {
                ...baseMutation,
                delete: [deletedRootNode.id],
              },
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_ROOT_NODE_EMPTY)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not delete a nested todo nodes still referenced by its parent', async () => {
      const { id, root, nodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const todoNode_0 = await createTestTodoNode({ todoId: id })

          const rootNode = nodes[0]

          assert(rootNode)

          await updateTestTodoNodeChildren(rootNode.id, [todoNode_0.id])

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root },
              mutations: { ...baseMutation, delete: [todoNode_0.id] },
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_DELETE_PARENT_NODE_CONFLICT)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not delete a todo node set as root node', async () => {
      const { id, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNodeId = root[0]

          assert(deletedTodoNodeId)

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ children: { root }, mutations: { ...baseMutation, delete: [deletedTodoNodeId] } }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_DELETE_ROOT_NODE_CONFLICT)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not delete a nonexisting todo node', async () => {
      const { id, nodes, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNodeId = nodes[0]?.id

          assert(deletedTodoNodeId)

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root },
              mutations: { ...baseMutation, delete: ['nonexistingTodoNodeId'] },
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_DELETE_DOES_NOT_EXIST)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not delete an updated todo node', async () => {
      const { id, nodes, root } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNode = nodes[0]

          assert(deletedTodoNode)

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: { root },
              mutations: {
                ...baseMutation,
                delete: [deletedTodoNode.id],
                update: { [deletedTodoNode.id]: deletedTodoNode },
              },
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_DELETE_UPDATE_CONFLICT)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should properly mutate various todo nodes', async () => {
      const { id, nodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          /**
           * Before:
           *
           * node_0
           * |__ node_0_0
           * |__ node_0_1               <- deleted
           *     |__ node_0_1_0
           *     |__ node_0_1_1
           *         |__ node_0_1_1_0
           *     |__ node_0_1_2
           * |__ node_0_2
           * |__ node_0_3               <- moved to root node 2nd child
           * node_1                     <- moved to node_0 first child
           * |__ node_1_0
           *     |__ node_1_0_0         <- renamed to node_1_0_0_updated
           * node_2
           * node_3                     <- moved before node_2
           */

          const node_0 = nodes[0]

          assert(node_0)

          const node_0_1_1_0 = await createTestTodoNode({ todoId: id })

          const node_0_1_0 = await createTestTodoNode({ todoId: id })
          const node_0_1_1 = await createTestTodoNode({ todoId: id, children: [node_0_1_1_0.id] })
          const node_0_1_2 = await createTestTodoNode({ todoId: id })

          const node_0_0 = await createTestTodoNode({ todoId: id })
          const node_0_1 = await createTestTodoNode({
            todoId: id,
            children: [node_0_1_0.id, node_0_1_1.id, node_0_1_2.id],
          })
          const node_0_2 = await createTestTodoNode({ todoId: id })
          const node_0_3 = await createTestTodoNode({ todoId: id })

          await updateTestTodoNodeChildren(node_0.id, [node_0_0.id, node_0_1.id, node_0_2.id, node_0_3.id])

          const node_1_0_0 = await createTestTodoNode({ todoId: id })

          const node_1_0 = await createTestTodoNode({ todoId: id, children: [node_1_0_0.id] })

          const node_1 = await createTestTodoNode({ todoId: id, children: [node_1_0.id] })
          const node_2 = await createTestTodoNode({ todoId: id })
          const node_3 = await createTestTodoNode({ todoId: id })

          await updateTestTodoRoot(id, [node_0.id, node_1.id, node_2.id, node_3.id])

          /**
           * After:
           *
           * node_0
           * |__ node_1
           *     |__ node_1_0
           *         |__ node_1_0_0_updated
           * |__ node_0_0
           *     |__ node_0_0_0_inserted
           * |__ node_0_2
           * node_0_3
           * node_3
           * node_2
           */

          const node_1_0_0_new_name = 'node_1_0_0_updated'
          const node_0_0_0_inserted = getFakeTodoNode()

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              children: {
                root: [node_0.id, node_0_3.id, node_3.id, node_2.id],
                [node_0.id]: [node_1.id, node_0_0.id, node_0_2.id],
                [node_0_0.id]: [node_0_0_0_inserted.id],
              },
              mutations: {
                ...baseMutation,
                delete: [node_0_1.id],
                update: {
                  [node_1_0_0.id]: { ...node_1_0_0, content: node_1_0_0_new_name },
                  [node_0.id]: { ...node_0 },
                  [node_0_0.id]: { ...node_0_0 },
                },
                insert: {
                  [node_0_0_0_inserted.id]: node_0_0_0_inserted,
                },
              },
            }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.nodes.length).toBe(10)

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
          expect(testTodoNode?.children.length).toBe(1)
          expect(testTodoNode?.children[0]).toBe(node_1_0_0.id)

          testTodoNode = await getTestTodoNode(node_1_0_0.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.children.length).toBe(0)
          expect(testTodoNode?.content).toBe(node_1_0_0_new_name)

          testTodoNode = await getTestTodoNode(node_0_0.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.children.length).toBe(1)
          expect(testTodoNode?.children[0]).toBe(node_0_0_0_inserted.id)

          testTodoNode = await getTestTodoNode(node_0_0_0_inserted.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.children.length).toBe(0)
          expect(testTodoNode?.content).toBe(node_0_0_0_inserted.content)

          testTodoNode = await getTestTodoNode(node_0_2.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.children.length).toBe(0)

          testTodoNode = await getTestTodoNode(node_0_3.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.children.length).toBe(0)

          testTodoNode = await getTestTodoNode(node_3.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.children.length).toBe(0)

          testTodoNode = await getTestTodoNode(node_2.id)

          expect(testTodoNode).toBeDefined()
          expect(testTodoNode?.children.length).toBe(0)

          const deletedNodeIds = [node_0_1.id, node_0_1_0.id, node_0_1_1.id, node_0_1_1_0.id, node_0_1_2.id]

          for (const deletedNodeId of deletedNodeIds) {
            testTodoNode = await getTestTodoNode(deletedNodeId)

            expect(testTodoNode).toBe(null)
          }
        },
        { dynamicRouteParams: { id } }
      )
    })
  })
})

function getFakeTodoNode(options?: Partial<TodoNodeData>): TodoNodeData {
  return {
    id: options?.id ?? cuid(),
    content: options?.content ?? faker.lorem.words(),
  }
}
