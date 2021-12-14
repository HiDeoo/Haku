import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { type Session } from 'next-auth'
import { StatusCode } from 'status-code-enum'

import { HttpMethod } from 'libs/http'

export function createApiRoute<Get, Post, Put, Delete, Patch>(
  route: ApiRoute<Get, Post, Put, Delete, Patch>,
  middlewares?: ApiMiddleware[]
) {
  const orderedMiddlewares = middlewares?.reverse()

  return async (
    req: NextApiRequest,
    res: NextApiResponse<Get | Post | Put | Delete | Patch | ApiClientErrorResponse>
  ) => {
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
      let message = 'Something went wrong!'

      if (error instanceof ApiClientError) {
        statusCode = error.httpStatusCode
        message = error.message
      } else {
        console.error('Unhandled API error:', error)
      }

      return res.status(statusCode).json({ error: message })
    }
  }
}

export function getApiRequestUser(req: NextApiRequest): Omit<Session['user'], 'id'> & { userId: UserId } {
  if (!req.user) {
    throw new Error('Unauthenticated API request received for an authenticated endpoint.')
  }

  return { ...req.user, userId: req.user.id }
}

export class ApiClientError extends Error {
  constructor(public message: string, public httpStatusCode: StatusCode = StatusCode.ClientErrorForbidden) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

interface ApiRoute<Get, Post, Put, Delete, Patch> {
  get?: NextApiHandler<Get>
  post?: NextApiHandler<Post>
  put?: NextApiHandler<Put>
  delete?: NextApiHandler<Delete>
  patch?: NextApiHandler<Patch>
}

type ApiMiddleware = (handler: NextApiHandler) => NextApiHandler

interface ApiClientErrorResponse {
  error: string
}
