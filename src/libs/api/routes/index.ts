import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from 'next'
import { StatusCode } from 'status-code-enum'

import { HttpMethod } from 'libs/http'
import { type ApiErrorResponse, API_ERROR_UNKNOWN, ApiError } from 'libs/api/routes/errors'
import { type ApiRequestValidationData, type ValidatedApiRequest } from 'libs/api/routes/middlewares'

export function createApiRoute<Get = never, Post = never, Put = never, Delete = never, Patch = never>(
  route: ApiRoute<Get, Post, Put, Delete, Patch>,
  middlewares?: ApiMiddleware[]
) {
  const orderedMiddlewares = middlewares?.reverse()

  return async (req: NextApiRequest, res: NextApiResponse<Get | Post | Put | Delete | Patch | ApiErrorResponse>) => {
    let handler: NextApiHandler | undefined

    if (req.method === HttpMethod.GET && route.get) {
      handler = route.get
    } else if (req.method === HttpMethod.POST && route.post) {
      handler = route.post
    } else if (req.method === HttpMethod.PUT && route.put) {
      handler = route.put
    } else if (req.method === HttpMethod.DELETE && route.delete) {
      handler = route.delete
    } else if (req.method === HttpMethod.PATCH && route.patch) {
      handler = route.patch
    }

    if (!handler) {
      return res.status(StatusCode.ClientErrorMethodNotAllowed).end()
    }

    try {
      if (orderedMiddlewares) {
        for (const middleware of orderedMiddlewares) {
          handler = middleware(handler)
        }
      }

      await handler(req, res)
    } catch (error) {
      let statusCode = StatusCode.ServerErrorInternal
      let message = API_ERROR_UNKNOWN

      if (error instanceof ApiError) {
        statusCode = error.httpStatusCode
        message = error.message
      } else {
        console.error('Unhandled API error:', error)
      }

      return res.status(statusCode).json({ error: message })
    }
  }
}

export function getApiRequestUser<Data extends ApiRequestValidationData>(
  req: NextApiRequest | ValidatedApiRequest<Data>
): UserWithUserId {
  if (!req.user) {
    throw new Error('Unauthenticated API request received for an authenticated endpoint.')
  }

  return { ...req.user, userId: req.user.id }
}

interface ApiRoute<Get, Post, Put, Delete, Patch> {
  get?: NextApiHandler<Get>
  post?: NextApiHandler<Post>
  put?: NextApiHandler<Put>
  delete?: NextApiHandler<Delete>
  patch?: NextApiHandler<Patch>
}

type ApiMiddleware = (handler: NextApiHandler) => NextApiHandler
