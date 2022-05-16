import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { addTodo, type TodoMetadata } from 'libs/db/todo'
import { updateTodoNodes } from 'libs/db/todoNodes'
import { getTodoFromDynalistOpml } from 'libs/dynalist'
import { z } from 'libs/validation'

const postBodySchema = z.object({
  opml: z.string(),
})

const route = createApiRoute(
  {
    post: withValidation(postHandler, postBodySchema),
  },
  [withAuth]
)

export default route

async function postHandler(req: ValidatedApiRequest<{ body: ImportDynalistBody }>, res: NextApiResponse<TodoMetadata>) {
  const { userId } = getApiRequestUser(req)

  const { children, name, nodes } = await getTodoFromDynalistOpml(req.body.opml)

  const todo = await addTodo(userId, name, undefined, false)

  await updateTodoNodes(todo.id, userId, { children, mutations: { delete: [], insert: nodes, update: {} } })

  return res.status(200).json(todo)
}

export type ImportDynalistBody = z.infer<typeof postBodySchema>
