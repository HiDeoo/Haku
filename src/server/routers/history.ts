import { getHistory } from 'libs/db/history'
import { authProcedure, router } from 'server'

export const historyRouter = router({
  history: authProcedure.query(async ({ ctx }) => {
    const history = await getHistory(ctx.user.id)

    return history
  }),
})
