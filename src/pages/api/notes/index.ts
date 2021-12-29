import type { NextApiRequest, NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { getNoteTree, type NoteTreeData } from 'libs/db/tree'
import { z } from 'libs/validation'
import { addNote, type NoteData } from 'libs/db/note'

const postBodySchema = z.object({
  name: z.string(),
  folderId: z.number().optional(),
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
  const content = await getNoteTree(userId)

  return res.status(200).json(content)
}

async function postHandler(req: ValidatedApiRequest<{ body: AddNoteBody }>, res: NextApiResponse<NoteData>) {
  const { userId } = getApiRequestUser(req)
  const note = await addNote(userId, req.body.name, req.body.folderId)

  return res.status(200).json(note)
}

type AddNoteBody = z.infer<typeof postBodySchema>
