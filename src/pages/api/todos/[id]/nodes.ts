import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { z, zQuerySchemaWithId } from 'libs/validation'
import { updateTodoNodes } from 'libs/db/todoNodes'

const mutationMapSchema = z.record(
  z.object({
    id: z.string(),
    children: z.string().array(),
    content: z.string(),
  })
)

const patchBodySchema = z.object({
  mutations: z.object({
    delete: z.string().array(),
    insert: mutationMapSchema,
    update: mutationMapSchema,
  }),
  rootNodes: z.string().array(),
})

const route = createApiRoute(
  {
    patch: withValidation(patchHandler, patchBodySchema, zQuerySchemaWithId),
  },
  [withAuth]
)

export default route

async function patchHandler(
  req: ValidatedApiRequest<{ body: UpdateTodoNodesBody; query: UpdateTodoNodesQuery }>,
  res: NextApiResponse<void>
) {
  const { userId } = getApiRequestUser(req)

  await updateTodoNodes(req.query.id, userId, req.body)

  return res.status(200).json()
}

export type UpdateTodoNodesBody = z.infer<typeof patchBodySchema>
export type UpdateTodoNodesQuery = z.infer<typeof zQuerySchemaWithId>
