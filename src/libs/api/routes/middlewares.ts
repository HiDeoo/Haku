import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import StatusCode from 'status-code-enum'

import { z } from 'libs/validation'

export function withAdmin(handler: NextApiHandler) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const apiKey = req.headers['api-key']

    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(StatusCode.ClientErrorUnauthorized).end()
    }

    return handler(req, res)
  }
}

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req })

    if (!session) {
      return res.status(StatusCode.ClientErrorUnauthorized).end()
    }

    req.user = session.user

    return handler(req, res)
  }
}

export function withValidation<
  TData extends ApiRequestValidationData,
  TSchema extends ApiRequestValidationSchema,
  TResponseType
>(
  handler: ApiHandlerWithValidation<TData, TResponseType>,
  bodySchema?: TSchema['body'],
  querySchema?: TSchema['query']
) {
  return (req: NextApiRequest, res: NextApiResponse<TResponseType>) => {
    try {
      req.body = bodySchema?.parse(parseJson(req.body))
      req.query = querySchema?.parse(parseJson(req.query)) as NextApiRequest['query']

      return handler(req, res)
    } catch (error) {
      return res.status(StatusCode.ClientErrorBadRequest).end()
    }
  }
}

function parseJson(json: unknown) {
  return typeof json === 'string' ? JSON.parse(json) : json
}

type ValidationSchema = z.ZodType<unknown>
type ApiRequestValidationSchema = { body?: ValidationSchema; query?: ValidationSchema }
export type ApiRequestValidationData = { body?: unknown; query?: unknown }

export type ValidatedApiRequest<TSchema extends ApiRequestValidationData> = Omit<NextApiRequest, 'body' | 'query'> & {
  body: TSchema['body']
  query: TSchema['query']
}

type ApiHandlerWithValidation<TSchema extends ApiRequestValidationData, TResponseType> = (
  req: ValidatedApiRequest<TSchema>,
  res: NextApiResponse<TResponseType>
) => void | Promise<void>
