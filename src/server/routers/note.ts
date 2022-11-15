import { addNote, getNote, removeNote, updateNote } from 'libs/db/note'
import { getNoteTree } from 'libs/db/tree'
import { z, zAtLeastOneOf, zId } from 'libs/validation'
import { authProcedure, router } from 'server'

export const noteRouter = router({
  list: authProcedure.query(async ({ ctx }) => {
    const tree = await getNoteTree(ctx.user.id)

    return tree
  }),
  byId: authProcedure
    .input(
      z.object({
        id: zId,
      })
    )
    .query(async ({ ctx, input }) => {
      const note = await getNote(input.id, ctx.user.id)

      return note
    }),
  add: authProcedure
    .input(
      z.object({
        name: z.string(),
        folderId: zId.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const note = await addNote(ctx.user.id, input.name, input.folderId)

      return note
    }),
  update: authProcedure
    .input(
      z
        .object({
          id: zId,
        })
        .and(
          zAtLeastOneOf(
            z.object({
              name: z.string(),
              folderId: zId.nullable(),
              html: z.string(),
              text: z.string(),
            })
          )
        )
    )
    .mutation(async ({ ctx, input }) => {
      const note = await updateNote(input.id, ctx.user.id, input)

      return note
    }),
  delete: authProcedure
    .input(
      z.object({
        id: zId,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await removeNote(input.id, ctx.user.id)

      return
    }),
})
