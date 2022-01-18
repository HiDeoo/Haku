import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { z, zAtLeastOneOf, zQuerySchemaWithId } from 'libs/validation'
import { type NoteMetadata, removeNote, updateNote, type NoteData, getNote } from 'libs/db/note'

const patchBodySchema = zAtLeastOneOf(
  z.object({
    name: z.string(),
    folderId: z.string().nullable(),
    html: z.string(),
    text: z.string(),
  })
)

const route = createApiRoute(
  {
    delete: withValidation(deleteHandler, undefined, zQuerySchemaWithId),
    get: withValidation(getHandler, undefined, zQuerySchemaWithId),
    patch: withValidation(patchHandler, patchBodySchema, zQuerySchemaWithId),
  },
  [withAuth]
)

export default route

async function deleteHandler(req: ValidatedApiRequest<{ query: RemoveNoteQuery }>, res: NextApiResponse<void>) {
  const { userId } = getApiRequestUser(req)

  await removeNote(req.query.id, userId)

  return res.status(200).end()
}

async function getHandler(req: ValidatedApiRequest<{ query: GetNoteQuery }>, res: NextApiResponse<NoteData>) {
  const { userId } = getApiRequestUser(req)
  const content = await getNote(req.query.id, userId)

  return res.status(200).json(content)
}

async function patchHandler(
  req: ValidatedApiRequest<{ body: UpdateNoteBody; query: UpdateNoteQuery }>,
  res: NextApiResponse<NoteMetadata>
) {
  const { userId } = getApiRequestUser(req)

  const note = await updateNote(req.query.id, userId, req.body)

  return res.status(200).json(note)
}

export type RemoveNoteQuery = z.infer<typeof zQuerySchemaWithId>
export type GetNoteQuery = z.infer<typeof zQuerySchemaWithId>
export type UpdateNoteBody = z.infer<typeof patchBodySchema>
export type UpdateNoteQuery = z.infer<typeof zQuerySchemaWithId>
