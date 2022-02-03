import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { z, zQuerySchemaWithId } from 'libs/validation'
import { getTodoNodes, type TodoNodesData, updateTodoNodes } from 'libs/db/todoNodes'

const mutationMapSchema = z.record(
  z.object({
    id: z.string().cuid(),
    content: z.string(),
    completed: z.boolean(),
    noteHtml: z.string().nullable(),
    noteText: z.string().nullable(),
  })
)

const patchBodySchema = z.object({
  mutations: z.object({
    delete: z.string().array(),
    insert: mutationMapSchema,
    update: mutationMapSchema,
  }),
  children: z.object({ root: z.string().array() }).and(z.record(z.string().array())),
})

const route = createApiRoute(
  {
    get: withValidation(getHandler, undefined, zQuerySchemaWithId),
    patch: withValidation(patchHandler, patchBodySchema, zQuerySchemaWithId),
  },
  [withAuth]
)

export default route

async function getHandler(req: ValidatedApiRequest<{ query: GetTodoNodesQuery }>, res: NextApiResponse<TodoNodesData>) {
  const { userId } = getApiRequestUser(req)

  const nodes = await getTodoNodes(req.query.id, userId)

  return res.status(200).json(nodes)
}

async function patchHandler(
  req: ValidatedApiRequest<{ body: UpdateTodoNodesBody; query: UpdateTodoNodesQuery }>,
  res: NextApiResponse<void>
) {
  const { userId } = getApiRequestUser(req)

  await updateTodoNodes(req.query.id, userId, req.body)

  return res.status(200).json()
}

export type GetTodoNodesQuery = z.infer<typeof zQuerySchemaWithId>
export type UpdateTodoNodesBody = z.infer<typeof patchBodySchema>
export type UpdateTodoNodesQuery = z.infer<typeof zQuerySchemaWithId>
