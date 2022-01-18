import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

import { ApiError } from 'libs/api/routes/errors'

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
          apiClientErrorMessage = options.unique?.[error.meta.target.join('_')]
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
        if (isDbErrorMetaWithCause(error.meta)) {
          if (error.meta.cause === 'Record to delete does not exist.' && options.delete) {
            apiClientErrorMessage = options.delete
          } else if (error.meta.cause === 'Record to update not found.' && options.update) {
            apiClientErrorMessage = options.update
          }
        }

        break
      }
    }
  }

  if (apiClientErrorMessage) {
    throw new ApiError(apiClientErrorMessage)
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

// Multi-column constraints should be identified using a string being an underscore separated list of columns.
export interface DbErrorHandlerOptions {
  delete?: string
  fKey?: Record<string, string>
  unique?: Record<string, string>
  update?: string
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
