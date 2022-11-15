import { getFiles } from 'libs/db/file'
import { authProcedure, router } from 'server'

export const fileRouter = router({
  list: authProcedure.query(async ({ ctx }) => {
    const files = await getFiles(ctx.user.id)

    return files
  }),
})
