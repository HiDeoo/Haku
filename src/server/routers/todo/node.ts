import { getTodoNodes, updateTodoNodes } from 'libs/db/todoNodes'
import { z, zId, zTodoNodeStatus } from 'libs/validation'
import { createRouter } from 'server'
import { withAuth } from 'server/middlewares/withAuth'

const mutationMapSchema = z.record(
  z.object({
    id: zId,
    collapsed: z.boolean(),
    content: z.string(),
    noteHtml: z.string().nullable(),
    noteText: z.string().nullable(),
    status: zTodoNodeStatus,
  })
)

export const todoNodeRouter = createRouter()
  .middleware(withAuth)
  .query('byId', {
    input: z.object({
      id: zId,
    }),
    async resolve({ ctx, input }) {
      const nodes = await getTodoNodes(input.id, ctx.user.id)

      return nodes
    },
  })
  .mutation('update', {
    input: z.object({
      id: zId,
      mutations: z.object({
        delete: z.string().array(),
        insert: mutationMapSchema,
        update: mutationMapSchema,
      }),
      children: z.object({ root: z.string().array() }).and(z.record(z.string().array())),
    }),
    async resolve({ ctx, input }) {
      await updateTodoNodes(input.id, ctx.user.id, input)

      return
    },
  })
