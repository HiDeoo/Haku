import { addTodo } from 'libs/db/todo'
import { updateTodoNodes } from 'libs/db/todoNodes'
import { getTodoFromDynalistOpml } from 'libs/dynalist'
import { z } from 'libs/validation'
import { authProcedure, router } from 'server'

export const importDynalistRouter = router({
  dynalist: authProcedure
    .input(
      z.object({
        opml: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { children, name, nodes } = await getTodoFromDynalistOpml(input.opml)

      const todo = await addTodo(ctx.user.id, name, undefined, false)

      await updateTodoNodes(todo.id, ctx.user.id, { children, mutations: { delete: [], insert: nodes, update: {} } })

      return todo
    }),
})
