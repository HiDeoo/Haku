import { addTodo, removeTodo, updateTodo } from 'libs/db/todo'
import { getTodoTree } from 'libs/db/tree'
import { z, zAtLeastOneOf, zId } from 'libs/validation'
import { authProcedure, router } from 'server'
import { todoNodeRouter } from 'server/routers/todo/node'

export const todoRouter = router({
  list: authProcedure.query(async ({ ctx }) => {
    const tree = await getTodoTree(ctx.user.id)

    return tree
  }),
  add: authProcedure
    .input(
      z.object({
        name: z.string(),
        folderId: zId.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await addTodo(ctx.user.id, input.name, input.folderId)

      return todo
    }),
  update: authProcedure
    .input(
      z
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
        )
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await updateTodo(input.id, ctx.user.id, input)

      return todo
    }),
  delete: authProcedure
    .input(
      z.object({
        id: zId,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await removeTodo(input.id, ctx.user.id)

      return
    }),
  node: todoNodeRouter,
})
