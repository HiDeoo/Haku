import { testApiRoute } from 'tests/integration'
import { HttpMethod } from 'libs/http'
import idHandler from 'pages/api/todos/[id]/nodes'
import { createTestTodo, createTestTodoNode, getTestTodo } from 'tests/integration/db'

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
            body: JSON.stringify({ rootNodes: [...rootNodes, nodeId] }),
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
            body: JSON.stringify({ rootNodes: [nodeId, ...rootNodes] }),
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
            body: JSON.stringify({ rootNodes: [nodeId] }),
          })

          const testTodo = await getTestTodo(id)

          expect(testTodo?.rootNodes.length).toBe(1)

          expect(testTodo?.rootNodes[0]).toBe(nodeId)
        },
        { dynamicRouteParams: { id } }
      )
    })
  })
})
