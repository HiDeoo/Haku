import type { NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { z, zOneOf, zStringAsNumber } from 'libs/validation'
import { type FolderData, updateFolder } from 'libs/db/folder'

const patchBodySchema = zOneOf(
  z.object({
    name: z.string(),
    parentId: z.number().nullable(),
  })
)

const patchQuerySchema = z.object({
  id: zStringAsNumber,
})

const route = createApiRoute(
  {
    patch: withValidation(patchHandler, patchBodySchema, patchQuerySchema),
  },
  [withAuth]
)

export default route

async function patchHandler(
  req: ValidatedApiRequest<{ body: typeof patchBodySchema; query: typeof patchQuerySchema }>,
  res: NextApiResponse<FolderData>
) {
  const { userId } = getApiRequestUser(req)

  const folder = await updateFolder(req.query.id, userId, req.body)

  return res.status(200).json(folder)
}
