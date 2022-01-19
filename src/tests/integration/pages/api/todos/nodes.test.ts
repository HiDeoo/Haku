import assert from 'assert'

import faker from '@faker-js/faker'
import { type TodoNode } from '@prisma/client'
import cuid from 'cuid'
import { StatusCode } from 'status-code-enum'

import { getTestUser, testApiRoute } from 'tests/integration'
import { HttpMethod } from 'libs/http'
import idHandler, { type UpdateTodoNodesBody } from 'pages/api/todos/[id]/nodes'
import {
  createTestTodo,
  createTestTodoNode,
  getTestTodo,
  getTestTodoNode,
  updateTestTodoNodeChildren,
} from 'tests/integration/db'
import { type TodoNodeData } from 'libs/db/todoNodes'
import {
  API_ERROR_TODO_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ALREADY_EXISTS,
  API_ERROR_TODO_NODE_DELETE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_DELETE_ROOT_NODE_CONFLICT,
  API_ERROR_TODO_NODE_DELETE_UPDATE_CONFLICT,
  API_ERROR_TODO_NODE_INSERT_CHILD_DELETE_CONFLICT,
  API_ERROR_TODO_NODE_INSERT_CHILD_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ROOT_NODE_DOES_NOT_EXIST,
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
  describe('PATCH', () => {
    test('should not mutate todo nodes not owned by the current user', async () => {
      const { id, rootNodes } = await createTestTodo({ userId: getTestUser('1').userId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: nodeId } = await createTestTodoNode({ todoId: id })

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ mutations: baseMutation, rootNodes: [...rootNodes, nodeId] }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_DOES_NOT_EXIST)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should add a previously known node to the root nodes after the default one', async () => {
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: nodeId } = await createTestTodoNode({ todoId: id })

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ mutations: baseMutation, rootNodes: [...rootNodes, nodeId] }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.rootNodes.length).toBe(2)

          expect(testTodo?.rootNodes[0]).toBe(rootNodes[0])

          expect(testTodo?.rootNodes[1]).toBe(nodeId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should add a previously known node to the root nodes before the default one', async () => {
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: nodeId } = await createTestTodoNode({ todoId: id })

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ mutations: baseMutation, rootNodes: [nodeId, ...rootNodes] }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.rootNodes.length).toBe(2)

          expect(testTodo?.rootNodes[0]).toBe(nodeId)

          expect(testTodo?.rootNodes[1]).toBe(rootNodes[0])
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
            body: JSON.stringify({ mutations: baseMutation, rootNodes: [nodeId] }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.rootNodes.length).toBe(1)

          expect(testTodo?.rootNodes[0]).toBe(nodeId)
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
              rootNodes: [newTodoNode.id],
              mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
            }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.rootNodes.length).toBe(1)

          expect(testTodo?.rootNodes[0]).toBe(newTodoNode.id)
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
            body: JSON.stringify({ mutations: baseMutation, rootNodes: [nodeId] }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_ROOT_NODE_DOES_NOT_EXIST)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should insert a new todo node', async () => {
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode = getFakeTodoNode()

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
              rootNodes,
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
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNodeChildId = rootNodes[0]

          assert(newTodoNodeChildId)

          const newTodoNode = getFakeTodoNode()
          newTodoNode.children = [newTodoNodeChildId]

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
              rootNodes,
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
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode = getFakeTodoNode()
          const newTodoNodeChild = getFakeTodoNode()
          newTodoNode.children = [newTodoNodeChild.id]

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: {
                ...baseMutation,
                insert: { [newTodoNode.id]: newTodoNode, [newTodoNodeChild.id]: newTodoNodeChild },
              },
              rootNodes,
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
      const { id, rootNodes, nodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode_0 = getFakeTodoNode()
          const newTodoNode_0_0 = getFakeTodoNode()

          newTodoNode_0.children = [newTodoNode_0_0.id]

          const rootNode: TodoNode | undefined = nodes.find((node) => node.id === rootNodes[0])

          assert(rootNode)

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: {
                ...baseMutation,
                insert: { [newTodoNode_0.id]: newTodoNode_0, [newTodoNode_0_0.id]: newTodoNode_0_0 },
                update: { [rootNode.id]: { ...rootNode, children: [...rootNode.children, newTodoNode_0.id] } },
              },
              rootNodes,
            }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.nodes.length).toBe(3)

          const testTodoNode_0 = await getTestTodoNode(newTodoNode_0.id)

          expect(testTodoNode_0).toBeDefined()
          expect(testTodoNode_0?.todoId).toBe(id)
          expect(testTodoNode_0?.content).toBe(newTodoNode_0.content)
          expect(testTodoNode_0?.children).toEqual(newTodoNode_0.children)

          const testTodoNode_0_0 = await getTestTodoNode(newTodoNode_0_0.id)

          expect(testTodoNode_0_0).toBeDefined()
          expect(testTodoNode_0_0?.todoId).toBe(id)
          expect(testTodoNode_0_0?.content).toBe(newTodoNode_0_0.content)
          expect(testTodoNode_0_0?.children).toEqual(newTodoNode_0_0.children)

          const testRootTodoNode = await getTestTodoNode(rootNode.id)

          expect(testRootTodoNode?.children.length).toBe(1)
          expect(testRootTodoNode?.children[0]).toBe(newTodoNode_0.id)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should insert a new todo node as children of a root node', async () => {
      const { id, rootNodes, nodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode = getFakeTodoNode()

          const rootNode: TodoNode | undefined = nodes.find((node) => node.id === rootNodes[0])

          assert(rootNode)

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: {
                ...baseMutation,
                insert: { [newTodoNode.id]: newTodoNode },
                update: { [rootNode.id]: { ...rootNode, children: [...rootNode.children, newTodoNode.id] } },
              },
              rootNodes,
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
      const { id, nodes, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode = getFakeTodoNode({ id: nodes[0]?.id })

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
              rootNodes,
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
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const newTodoNode = getFakeTodoNode()
          newTodoNode.children = ['nonexistingChildId']

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: { ...baseMutation, insert: { [newTodoNode.id]: newTodoNode } },
              rootNodes,
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
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNode = await createTestTodoNode({ todoId: id })

          const newTodoNode = getFakeTodoNode()
          newTodoNode.children = [deletedTodoNode.id]

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: {
                ...baseMutation,
                insert: { [newTodoNode.id]: newTodoNode },
                delete: [deletedTodoNode.id],
              },
              rootNodes,
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
      const { id, nodes, rootNodes } = await createTestTodo()

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
              mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
              rootNodes,
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
      const { id, nodes, rootNodes } = await createTestTodo()
      const childTodoNode = await createTestTodoNode({ todoId: id })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const updatedTodoNodeId = nodes[0]?.id

          assert(updatedTodoNodeId)

          const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })
          updatedTodoNode.children = [childTodoNode.id]

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
              rootNodes,
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
      const { id, nodes, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const updatedTodoNodeId = nodes[0]?.id

          assert(updatedTodoNodeId)

          const childTodoNode = getFakeTodoNode()

          const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })
          updatedTodoNode.children = [childTodoNode.id]

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: {
                ...baseMutation,
                update: { [updatedTodoNode.id]: updatedTodoNode },
                insert: { [childTodoNode.id]: childTodoNode },
              },
              rootNodes,
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

      const { id, nodes, rootNodes } = await createTestTodo({}, [todoNode_0.id, todoNode_1.id])

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const updatedTodoNode = nodes[0]

          assert(updatedTodoNode)

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: {
                ...baseMutation,
                update: { [updatedTodoNode.id]: { ...updatedTodoNode, children: [todoNode_1.id, todoNode_0.id] } },
              },
              rootNodes,
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
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const updatedTodoNode = getFakeTodoNode({ id: 'nonexistingTodoNodeId', content: 'updated todo node' })

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
              rootNodes,
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
      const { id, nodes, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const updatedTodoNodeId = nodes[0]?.id

          assert(updatedTodoNodeId)

          const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })
          updatedTodoNode.children = ['nonexistingChildId']

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: { ...baseMutation, update: { [updatedTodoNode.id]: updatedTodoNode } },
              rootNodes,
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
      const { id, nodes, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNode = createTestTodoNode({ todoId: id })

          const updatedTodoNodeId = nodes[0]?.id

          assert(updatedTodoNodeId)

          const updatedTodoNode = getFakeTodoNode({ id: updatedTodoNodeId })
          updatedTodoNode.children = [(await deletedTodoNode).id]

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: {
                ...baseMutation,
                update: { [updatedTodoNode.id]: updatedTodoNode },
                delete: [(await deletedTodoNode).id],
              },
              rootNodes,
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_UPDATE_CHILD_DELETE_CONFLICT)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should delete an existing todo node', async () => {
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNode = await createTestTodoNode({ todoId: id })

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ mutations: { ...baseMutation, delete: [deletedTodoNode.id] }, rootNodes }),
          })

          const testTodoNode = await getTestTodoNode(deletedTodoNode.id)

          expect(testTodoNode).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should delete nested todos', async () => {
      const { id, rootNodes, nodes } = await createTestTodo()

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

          const rootNodeId = nodes[0]?.id

          assert(rootNodeId)

          await updateTestTodoNodeChildren(rootNodeId, [todoNode_0.id])

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: { ...baseMutation, delete: [todoNode_0.id] },
              rootNodes,
            }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.nodes.length).toBe(1)

          const testRootTodoNode = await getTestTodo(rootNodeId)
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

    test('should not delete a todo node set as root node', async () => {
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNodeId = rootNodes[0]

          assert(deletedTodoNodeId)

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ mutations: { ...baseMutation, delete: [deletedTodoNodeId] }, rootNodes }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_DELETE_ROOT_NODE_CONFLICT)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not delete a nonexisting todo node', async () => {
      const { id, nodes, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNodeId = nodes[0]?.id

          assert(deletedTodoNodeId)

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ mutations: { ...baseMutation, delete: ['nonexistingTodoNodeId'] }, rootNodes }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_DELETE_DOES_NOT_EXIST)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not delete an updated todo node', async () => {
      const { id, nodes, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNode = nodes[0]

          assert(deletedTodoNode)

          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({
              mutations: {
                ...baseMutation,
                delete: [deletedTodoNode.id],
                update: { [deletedTodoNode.id]: deletedTodoNode },
              },
              rootNodes,
            }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_NODE_DELETE_UPDATE_CONFLICT)
        },
        { dynamicRouteParams: { id } }
      )
    })
  })
})

function getFakeTodoNode(options?: Partial<TodoNodeData>): TodoNodeData {
  return {
    id: options?.id ?? cuid(),
    children: [],
    content: options?.content ?? faker.lorem.words(),
  }
}
