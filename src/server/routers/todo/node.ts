import { getTodoNodes, updateTodoNodes } from 'libs/db/todoNodes'
import { z, zId, zTodoNodeStatus } from 'libs/validation'
import { authProcedure, router } from 'server'

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

export const todoNodeRouter = router({
  byId: authProcedure
    .input(
      z.object({
        id: zId,
      })
    )
    .query(async ({ ctx, input }) => {
      const nodes = await getTodoNodes(input.id, ctx.user.id)

      return nodes
    }),
  update: authProcedure
    .input(
      z.object({
        id: zId,
        mutations: z.object({
          delete: z.string().array(),
          insert: mutationMapSchema,
          update: mutationMapSchema,
        }),
        children: z.object({ root: z.string().array() }).and(z.record(z.string().array())),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateTodoNodes(input.id, ctx.user.id, input)

      return
    }),
})
