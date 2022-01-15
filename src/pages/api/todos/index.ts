import { type NextApiRequest, NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { withAuth } from 'libs/api/routes/middlewares'
import { z } from 'libs/validation'
import { getTodoTree, type TodoTreeData } from 'libs/db/tree'

const postBodySchema = z.object({
  name: z.string(),
  folderId: z.number().optional(),
})

const route = createApiRoute(
  {
    get: getHandler,
  },
  [withAuth]
)

export default route

async function getHandler(req: NextApiRequest, res: NextApiResponse<TodoTreeData>) {
  const { userId } = getApiRequestUser(req)
  const content = await getTodoTree(userId)

  return res.status(200).json(content)
}

export type AddTodoBody = z.infer<typeof postBodySchema>
