import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import StatusCode from 'status-code-enum'
import { z } from 'zod'

export function withAdmin(handler: NextApiHandler) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const apiKey = req.headers['api-key']

    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(StatusCode.ClientErrorUnauthorized).end()
    }

    return handler(req, res)
  }
}

export function withValidation(handler: NextApiHandler, schema: z.ZodType<unknown>) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    try {
      schema.parse(req.body)

      return handler(req, res)
    } catch (error) {
      return res.status(StatusCode.ClientErrorBadRequest).end()
    }
  }
}

export interface ValidatedApiRequest<T extends z.ZodType<unknown>> extends NextApiRequest {
  body: z.infer<T>
}
