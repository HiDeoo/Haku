import { addAllowedEmail, getAllowedEmails, removeAllowedEmail } from 'libs/db/emailAllowList'
import { z, zEmail, zId } from 'libs/validation'
import { adminProcedure, router } from 'server'

export const adminEmailRouter = router({
  list: adminProcedure.query(async () => {
    const emails = await getAllowedEmails()

    return emails
  }),
  add: adminProcedure
    .input(
      z.object({
        email: zEmail,
      })
    )
    .mutation(async ({ input }) => {
      const email = await addAllowedEmail(input.email)

      return email
    }),
  delete: adminProcedure
    .input(
      z.object({
        id: zId,
      })
    )
    .mutation(async ({ input }) => {
      await removeAllowedEmail(input.id)

      return
    }),
})
