import { SearchableContentType } from 'constants/contentType'
import { SEARCH_QUERY_MIN_LENGTH } from 'constants/search'
import { searchFiles } from 'libs/db/file'
import { z } from 'libs/validation'
import { authProcedure, router } from 'server'

export const searchRouter = router({
  search: authProcedure
    .input(
      z.object({
        q: z.string().min(SEARCH_QUERY_MIN_LENGTH),
        types: z.object({
          [SearchableContentType.INBOX]: z.boolean(),
          [SearchableContentType.NOTE]: z.boolean(),
          [SearchableContentType.TODO]: z.boolean(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const results = await searchFiles(ctx.user.id, input.q, input.types)

      return results
    }),
})
