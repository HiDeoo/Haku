import assert from 'assert'

import faker from '@faker-js/faker'
import cuid from 'cuid'
import { StatusCode } from 'status-code-enum'

import { testApiRoute } from 'tests/integration'
import { HttpMethod } from 'libs/http'
import idHandler, { type UpdateTodoNodesBody } from 'pages/api/todos/[id]/nodes'
import { createTestTodo, createTestTodoNode, getTestTodo, getTestTodoNode } from 'tests/integration/db'
import { type TodoNodeData } from 'libs/db/todoNodes'
import {
  API_ERROR_TODO_NODE_ALREADY_EXISTS,
  API_ERROR_TODO_NODE_DOES_NOT_EXIST,
  type ApiErrorResponse,
} from 'libs/api/routes/errors'

const baseMutation: UpdateTodoNodesBody['mutations'] = {
  delete: [],
  insert: {},
  update: {},
}

describe('todo nodes', () => {
  describe('PATCH', () => {
    test('should add a node to the root nodes after the default one', async () => {
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: nodeId } = await createTestTodoNode()

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

    test('should add a node to the root nodes before the default one', async () => {
      const { id, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: nodeId } = await createTestTodoNode()

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

    test('should replace the root nodes', async () => {
      const { id } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const { id: nodeId } = await createTestTodoNode()

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

    test('should not add multiple todo node with the same ID', async () => {
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
          expect(json.error).toBe(API_ERROR_TODO_NODE_DOES_NOT_EXIST)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should delete an existing todo node', async () => {
      const { id, nodes, rootNodes } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const deletedTodoNodeId = nodes[0]?.id

          assert(deletedTodoNodeId)

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ mutations: { ...baseMutation, delete: [deletedTodoNodeId] }, rootNodes }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.nodes.length).toBe(0)

          const testTodoNode = await getTestTodoNode(deletedTodoNodeId)

          expect(testTodoNode).toBeNull()
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

          await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ mutations: { ...baseMutation, delete: ['nonexistingTodoNodeId'] }, rootNodes }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.nodes.length).toBe(1)
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
