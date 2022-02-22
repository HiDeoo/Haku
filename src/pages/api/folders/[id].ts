import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { type FolderData, updateFolder, removeFolder } from 'libs/db/folder'
import { z, zAtLeastOneOf, zQuerySchemaWithId } from 'libs/validation'

const patchBodySchema = zAtLeastOneOf(
  z.object({
    name: z.string(),
    parentId: z.string().cuid().nullable(),
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

export type RemoveFolderQuery = z.infer<typeof zQuerySchemaWithId>
export type UpdateFolderBody = z.infer<typeof patchBodySchema>
export type UpdateFolderQuery = z.infer<typeof zQuerySchemaWithId>
