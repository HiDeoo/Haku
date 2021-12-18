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
  let apiClientErrorMessage: string | undefined

  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        if (isDbErrorMetaWithTarget(error.meta)) {
          const { target } = error.meta

          target.forEach((constraint) => {
            apiClientErrorMessage = options.unique?.[constraint]
          })
        }

        break
      }
      case 'P2003': {
        if (isDbErrorMetaWithFieldName(error.meta)) {
          apiClientErrorMessage = options.fKey?.[error.meta.field_name.replace('_fkey (index)', '')]
        }

        break
      }
      case 'P2025': {
        if (
          isDbErrorMetaWithCause(error.meta) &&
          error.meta.cause === 'Record to delete does not exist.' &&
          options.delete
        ) {
          apiClientErrorMessage = options.delete
        }

        break
      }
    }
  }

  if (apiClientErrorMessage) {
    throw new ApiClientError(apiClientErrorMessage)
  }

  throw error
}

function isDbErrorMetaWithTarget(meta: unknown): meta is DbErrorMetaWithTarget {
  return typeof meta !== 'undefined' && Array.isArray((meta as DbErrorMetaWithTarget).target)
}

function isDbErrorMetaWithCause(meta: unknown): meta is DbErrorMetaWithCause {
  return typeof meta !== 'undefined' && typeof (meta as DbErrorMetaWithCause).cause === 'string'
}

function isDbErrorMetaWithFieldName(meta: unknown): meta is DbErrorMetaWithFieldName {
  return typeof meta !== 'undefined' && typeof (meta as DbErrorMetaWithFieldName).field_name === 'string'
}

export interface DbErrorHandlerOptions {
  delete?: string
  fKey?: Record<string, string>
  unique?: Record<string, string>
}

interface DbErrorMetaWithTarget {
  target: string[]
}

interface DbErrorMetaWithCause {
  cause: string
}

interface DbErrorMetaWithFieldName {
  field_name: string
}
