import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { ApiClientError } from 'libs/api/routes'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export function handleDbError(error: unknown, options: DbErrorHandlerOptions): never {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        if (isDbErrorMetaWithTarget(error.meta)) {
          const { target } = error.meta

          target.forEach((constraint) => {
            const message = options.unique?.[constraint]

            if (message) {
              throw new ApiClientError(message)
            }
          })
        }

        break
      }
      case 'P2025': {
        if (
          isDbErrorMetaWithCause(error.meta) &&
          error.meta.cause === 'Record to delete does not exist.' &&
          options.delete
        ) {
          throw new ApiClientError(options.delete)
        }

        break
      }
    }
  }

  throw error
}

function isDbErrorMetaWithTarget(meta: unknown): meta is DbErrorMetaWithTarget {
  console.log('meta ', meta)
  return typeof meta !== 'undefined' && Array.isArray((meta as DbErrorMetaWithTarget).target)
}

function isDbErrorMetaWithCause(meta: unknown): meta is DbErrorMetaWithCause {
  return typeof meta !== 'undefined' && typeof (meta as DbErrorMetaWithCause).cause === 'string'
}

export interface DbErrorHandlerOptions {
  unique?: Record<string, string>
  delete?: string
}

interface DbErrorMetaWithTarget {
  target: string[]
}

interface DbErrorMetaWithCause {
  cause: string
}
