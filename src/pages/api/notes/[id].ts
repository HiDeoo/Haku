import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { z, zAtLeastOneOf, zStringAsNumber } from 'libs/validation'
import { type NoteMetaData, removeNote, updateNote } from 'libs/db/note'

const querySchema = z.object({
  id: zStringAsNumber,
})

const patchBodySchema = zAtLeastOneOf(
  z.object({
    name: z.string(),
    folderId: z.number().nullable(),
    html: z.string(),
    text: z.string(),
  })
)

const route = createApiRoute(
  {
    delete: withValidation(deleteHandler, undefined, querySchema),
    patch: withValidation(patchHandler, patchBodySchema, querySchema),
  },
  [withAuth]
)

export default route

async function deleteHandler(req: ValidatedApiRequest<{ query: RemoveNoteQuery }>, res: NextApiResponse<void>) {
  const { userId } = getApiRequestUser(req)

  await removeNote(req.query.id, userId)

  return res.status(200).end()
}

async function patchHandler(
  req: ValidatedApiRequest<{ body: UpdateNoteBody; query: UpdateNoteQuery }>,
  res: NextApiResponse<NoteMetaData>
) {
  const { userId } = getApiRequestUser(req)

  const note = await updateNote(req.query.id, userId, req.body)

  return res.status(200).json(note)
}

export type RemoveNoteQuery = z.infer<typeof querySchema>
export type UpdateNoteBody = z.infer<typeof patchBodySchema>
export type UpdateNoteQuery = z.infer<typeof querySchema>
