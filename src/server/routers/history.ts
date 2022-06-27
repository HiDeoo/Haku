import { getHistory } from 'libs/db/history'
import { createRouter } from 'server'
import { withAuth } from 'server/middlewares/withAuth'

export const historyRouter = createRouter()
  .middleware(withAuth)
  .query('history', {
    async resolve({ ctx }) {
      const history = await getHistory(ctx.user.id)

      return history
    },
  })
