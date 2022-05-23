import { addAllowedEmail, getAllowedEmails, removeAllowedEmail } from 'libs/db/emailAllowList'
import { z, zEmail, zId } from 'libs/validation'
import { createRouter } from 'server'

export const adminEmailRouter = createRouter()
  .query('list', {
    async resolve() {
      const emails = await getAllowedEmails()

      return emails
    },
  })
  .mutation('add', {
    input: z.object({
      email: zEmail,
    }),
    async resolve({ input }) {
      const email = await addAllowedEmail(input.email)

      return email
    },
  })
  .mutation('delete', {
    input: z.object({
      id: zId,
    }),
    async resolve({ input }) {
      await removeAllowedEmail(input.id)

      return
    },
  })
