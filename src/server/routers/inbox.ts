import { addInboxEntry, getInboxEntries, removeInboxEntry } from 'libs/db/inbox'
import { z, zId } from 'libs/validation'
import { createRouter } from 'server'
import withAuth from 'server/middlewares/withAuth'

export const inboxRouter = createRouter()
  .middleware(withAuth)
  .query('list', {
    async resolve({ ctx }) {
      const entries = await getInboxEntries(ctx.user.id)

      return entries
    },
  })
  .mutation('add', {
    input: z.object({
      text: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const entry = await addInboxEntry(ctx.user.id, input.text)

      return entry
    },
  })
  .mutation('delete', {
    input: z.object({
      id: zId,
    }),
    async resolve({ ctx, input }) {
      await removeInboxEntry(ctx.user.id, input.id)

      return
    },
  })
