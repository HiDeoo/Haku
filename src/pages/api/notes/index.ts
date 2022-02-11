import { type NextApiRequest, type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { getNoteTree, type NoteTreeData } from 'libs/db/tree'
import { z } from 'libs/validation'
import { addNote, type NoteMetadata } from 'libs/db/note'

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

async function getHandler(req: NextApiRequest, res: NextApiResponse<NoteTreeData>) {
  const { userId } = getApiRequestUser(req)

  const tree = await getNoteTree(userId)

  return res.status(200).json(tree)
}

async function postHandler(req: ValidatedApiRequest<{ body: AddNoteBody }>, res: NextApiResponse<NoteMetadata>) {
  const { userId } = getApiRequestUser(req)

  const note = await addNote(userId, req.body.name, req.body.folderId)

  return res.status(200).json(note)
}

export type AddNoteBody = z.infer<typeof postBodySchema>
