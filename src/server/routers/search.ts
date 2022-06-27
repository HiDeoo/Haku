import { SearchableContentType } from 'constants/contentType'
import { SEARCH_QUERY_MIN_LENGTH } from 'constants/search'
import { searchFiles } from 'libs/db/file'
import { z } from 'libs/validation'
import { createRouter } from 'server'
import { withAuth } from 'server/middlewares/withAuth'

export const searchRouter = createRouter()
  .middleware(withAuth)
  .query('search', {
    input: z.object({
      q: z.string().min(SEARCH_QUERY_MIN_LENGTH),
      types: z.object({
        [SearchableContentType.INBOX]: z.boolean(),
        [SearchableContentType.NOTE]: z.boolean(),
        [SearchableContentType.TODO]: z.boolean(),
      }),
    }),
    async resolve({ ctx, input }) {
      const results = await searchFiles(ctx.user.id, input.q, input.types)

      return results
    },
  })
