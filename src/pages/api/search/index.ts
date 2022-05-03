import { type NextApiResponse } from 'next'

import { createApiRoute, getApiRequestUser } from 'libs/api/routes'
import { type ValidatedApiRequest, withAuth, withValidation } from 'libs/api/routes/middlewares'
import { type SearchResultsData, searchFiles } from 'libs/db/file'
import { z } from 'libs/validation'

const getQueryScrhema = z.object({
  page: z.string().optional(),
  q: z.string(),
})

const route = createApiRoute(
  {
    get: withValidation(getHandler, undefined, getQueryScrhema),
  },
  [withAuth]
)

export default route

async function getHandler(
  req: ValidatedApiRequest<{ query: SearchFileQuery }>,
  res: NextApiResponse<SearchResultsData>
) {
  const { userId } = getApiRequestUser(req)

  const results = await searchFiles(userId, req.query.q, req.query.page)

  return res.status(200).json(results)
}

export type SearchFileQuery = z.infer<typeof getQueryScrhema>
