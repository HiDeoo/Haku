import { type NextApiRequest, NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { addTodo, type TodoMetadata } from 'libs/db/todo'
import { getTodoTree, type TodoTreeData } from 'libs/db/tree'
import { z } from 'libs/validation'

const postBodySchema = z.object({
  name: z.string(),
  folderId: z.string().cuid().optional(),
})

const route = createApiRoute(
  {
    get: getHandler,
    post: withValidation(postHandler, postBodySchema),
  },
  [withAuth]
)

export default route

async function getHandler(req: NextApiRequest, res: NextApiResponse<TodoTreeData>) {
  const { userId } = getApiRequestUser(req)

  const tree = await getTodoTree(userId)

  return res.status(200).json(tree)
}

async function postHandler(req: ValidatedApiRequest<{ body: AddTodoBody }>, res: NextApiResponse<TodoMetadata>) {
  const { userId } = getApiRequestUser(req)

  const todo = await addTodo(userId, req.body.name, req.body.folderId)

  return res.status(200).json(todo)
}

export type AddTodoBody = z.infer<typeof postBodySchema>
