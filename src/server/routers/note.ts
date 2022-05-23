import { addNote, getNote, removeNote, updateNote } from 'libs/db/note'
import { getNoteTree } from 'libs/db/tree'
import { z, zAtLeastOneOf, zId } from 'libs/validation'
import { createRouter } from 'server'
import withAuth from 'server/middlewares/withAuth'

export const noteRouter = createRouter()
  .middleware(withAuth)
  .query('list', {
    async resolve({ ctx }) {
      const tree = await getNoteTree(ctx.user.id)

      return tree
    },
  })
  .query('byId', {
    input: z.object({
      id: zId,
    }),
    async resolve({ ctx, input }) {
      const note = await getNote(input.id, ctx.user.id)

      return note
    },
  })
  .mutation('add', {
    input: z.object({
      name: z.string(),
      folderId: zId.optional(),
    }),
    async resolve({ ctx, input }) {
      const note = await addNote(ctx.user.id, input.name, input.folderId)

      return note
    },
  })
  .mutation('update', {
    input: z
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
      ),
    async resolve({ ctx, input }) {
      const note = await updateNote(input.id, ctx.user.id, input)

      return note
    },
  })
  .mutation('delete', {
    input: z.object({
      id: zId,
    }),
    async resolve({ ctx, input }) {
      await removeNote(input.id, ctx.user.id)

      return
    },
  })
