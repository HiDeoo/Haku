import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { z, zAtLeastOneOf, zStringAsNumber } from 'libs/validation'
import { type FolderData, updateFolder, removeFolder } from 'libs/db/folder'

const patchBodySchema = zAtLeastOneOf(
  z.object({
    name: z.string(),
    parentId: z.number().nullable(),
  })
)

const patchQuerySchema = z.object({
  id: zStringAsNumber,
})

const deleteQuerySchema = z.object({
  id: zStringAsNumber,
})

const route = createApiRoute(
  {
    delete: withValidation(deleteHandler, undefined, deleteQuerySchema),
    patch: withValidation(patchHandler, patchBodySchema, patchQuerySchema),
  },
  [withAuth]
)

export default route

async function deleteHandler(req: ValidatedApiRequest<{ query: RemoveFolderQuery }>, res: NextApiResponse<void>) {
  const { userId } = getApiRequestUser(req)

  await removeFolder(req.query.id, userId)

  return res.status(200).end()
}

async function patchHandler(
  req: ValidatedApiRequest<{ body: UpdateFolderBody; query: UpdateFolderQuery }>,
  res: NextApiResponse<FolderData>
) {
  const { userId } = getApiRequestUser(req)

  const folder = await updateFolder(req.query.id, userId, req.body)

  return res.status(200).json(folder)
}

export type RemoveFolderQuery = z.infer<typeof deleteQuerySchema>
export type UpdateFolderBody = z.infer<typeof patchBodySchema>
export type UpdateFolderQuery = z.infer<typeof patchQuerySchema>
