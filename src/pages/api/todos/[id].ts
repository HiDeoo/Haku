import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { z, zAtLeastOneOf, zQuerySchemaWithId } from 'libs/validation'
import { removeTodo, updateTodo, type TodoMetadata } from 'libs/db/todo'

const patchBodySchema = zAtLeastOneOf(
  z.object({
    name: z.string(),
    folderId: z.string().cuid().nullable(),
  })
)

const route = createApiRoute(
  {
    delete: withValidation(deleteHandler, undefined, zQuerySchemaWithId),
    patch: withValidation(patchHandler, patchBodySchema, zQuerySchemaWithId),
  },
  [withAuth]
)

export default route

async function deleteHandler(req: ValidatedApiRequest<{ query: RemoveTodoQuery }>, res: NextApiResponse<void>) {
  const { userId } = getApiRequestUser(req)

  await removeTodo(req.query.id, userId)

  return res.status(200).end()
}

async function patchHandler(
  req: ValidatedApiRequest<{ body: UpdateTodoBody; query: UpdateTodoQuery }>,
  res: NextApiResponse<TodoMetadata>
) {
  const { userId } = getApiRequestUser(req)

  const todo = await updateTodo(req.query.id, userId, req.body)

  return res.status(200).json(todo)
}

export type RemoveTodoQuery = z.infer<typeof zQuerySchemaWithId>
export type UpdateTodoBody = z.infer<typeof patchBodySchema>
export type UpdateTodoQuery = z.infer<typeof zQuerySchemaWithId>
