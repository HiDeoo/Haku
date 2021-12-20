import type { NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { z, zFolderType } from 'libs/validation'
import { addFolder, type FolderData } from 'libs/db/folder'

const postSchema = z.object({
  name: z.string(),
  parentId: z.number().optional(),
  type: zFolderType,
})

const route = createApiRoute(
  {
    post: withValidation(postHandler, postSchema),
  },
  [withAuth]
)

export default route

async function postHandler(req: ValidatedApiRequest<{ body: typeof postSchema }>, res: NextApiResponse<FolderData>) {
  const { userId } = getApiRequestUser(req)
  const folder = await addFolder(userId, req.body.type, req.body.name, req.body.parentId)

  return res.status(200).json(folder)
}
