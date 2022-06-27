import { addTodo, removeTodo, updateTodo } from 'libs/db/todo'
import { getTodoTree } from 'libs/db/tree'
import { z, zAtLeastOneOf, zId } from 'libs/validation'
import { createRouter } from 'server'
import { withAuth } from 'server/middlewares/withAuth'
import { todoNodeRouter } from 'server/routers/todo/node'

export const todoRouter = createRouter()
  .middleware(withAuth)
  .query('list', {
    async resolve({ ctx }) {
      const tree = await getTodoTree(ctx.user.id)

      return tree
    },
  })
  .mutation('add', {
    input: z.object({
      name: z.string(),
      folderId: zId.optional(),
    }),
    async resolve({ ctx, input }) {
      const todo = await addTodo(ctx.user.id, input.name, input.folderId)

      return todo
    },
  })
  .mutation('update', {
    input: z
      .object({
        id: zId,
      })
      .and(
        zAtLeastOneOf(
          z.object({
            name: z.string(),
            folderId: zId.nullable(),
          })
        )
      ),
    async resolve({ ctx, input }) {
      const todo = await updateTodo(input.id, ctx.user.id, input)

      return todo
    },
  })
  .mutation('delete', {
    input: z.object({
      id: zId,
    }),
    async resolve({ ctx, input }) {
      await removeTodo(input.id, ctx.user.id)

      return
    },
  })
  .merge('node.', todoNodeRouter)
