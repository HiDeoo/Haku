import { getFiles } from 'libs/db/file'
import { createRouter } from 'server'
import { withAuth } from 'server/middlewares/withAuth'

export const fileRouter = createRouter()
  .middleware(withAuth)
  .query('list', {
    async resolve({ ctx }) {
      const files = await getFiles(ctx.user.id)

      return files
    },
  })
