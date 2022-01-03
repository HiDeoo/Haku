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
  Data extends ApiRequestValidationData,
  Schema extends ApiRequestValidationSchema,
  ResponseType
>(handler: ApiHandlerWithValidation<Data, ResponseType>, bodySchema?: Schema['body'], querySchema?: Schema['query']) {
  return (req: NextApiRequest, res: NextApiResponse<ResponseType>) => {
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

export type ValidatedApiRequest<Schema extends ApiRequestValidationData> = Omit<NextApiRequest, 'body' | 'query'> & {
  body: Schema['body']
  query: Schema['query']
}

type ApiHandlerWithValidation<Schema extends ApiRequestValidationData, ResponseType> = (
  req: ValidatedApiRequest<Schema>,
  res: NextApiResponse<ResponseType>
) => void | Promise<void>
