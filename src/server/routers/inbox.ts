import { addInboxEntry, getInboxEntries, removeInboxEntry } from 'libs/db/inbox'
import { z, zId } from 'libs/validation'
import { authProcedure, router } from 'server'

export const inboxRouter = router({
  list: authProcedure.query(async ({ ctx }) => {
    const entries = await getInboxEntries(ctx.user.id)

    return entries
  }),
  add: authProcedure
    .input(
      z.object({
        text: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await addInboxEntry(ctx.user.id, input.text)

      return entry
    }),
  delete: authProcedure
    .input(
      z.object({
        id: zId,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await removeInboxEntry(ctx.user.id, input.id)

      return
    }),
})
