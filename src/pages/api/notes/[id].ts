import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { z, zAtLeastOneOf, zStringAsNumber } from 'libs/validation'
import { type NoteData, updateNote } from 'libs/db/note'

const patchBodySchema = zAtLeastOneOf(
  z.object({
    name: z.string(),
    folderId: z.number().nullable(),
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
  req: ValidatedApiRequest<{ body: UpdateNoteBody; query: UpdateNoteQuery }>,
  res: NextApiResponse<NoteData>
) {
  const { userId } = getApiRequestUser(req)

  const note = await updateNote(req.query.id, userId, req.body)

  return res.status(200).json(note)
}

type UpdateNoteBody = z.infer<typeof patchBodySchema>
type UpdateNoteQuery = z.infer<typeof patchQuerySchema>
