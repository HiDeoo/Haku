import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { z, zStringAsNumber } from 'libs/validation'
import { removeTodo } from 'libs/db/todo'

const querySchema = z.object({
  id: zStringAsNumber,
})

const route = createApiRoute(
  {
    delete: withValidation(deleteHandler, undefined, querySchema),
  },
  [withAuth]
)

export default route

async function deleteHandler(req: ValidatedApiRequest<{ query: RemoveTodoQuery }>, res: NextApiResponse<void>) {
  const { userId } = getApiRequestUser(req)

  await removeTodo(req.query.id, userId)

  return res.status(200).end()
}

export type RemoveTodoQuery = z.infer<typeof querySchema>
