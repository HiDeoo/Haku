import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { TRPCError } from '@trpc/server'
import { type TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'

import { API_ERROR_UNKNOWN } from 'constants/error'

declare global {
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#type-checking-for-globalthis
  // eslint-disable-next-line no-var -- adding as a member of globalThis
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

const dbCreateManyErrorRegExp =
  /^No '\w+' record \(needed to inline the relation on '\w+' record\) was found for a nested createMany on relation '\w+'\.$/

export function handleDbError(error: unknown, options: DbErrorHandlerOptions): never {
  let apiClientErrorMessage: string | undefined
  let apiClientErrorCode: TRPC_ERROR_CODE_KEY | undefined

  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        if (isDbErrorMetaWithTarget(error.meta)) {
          apiClientErrorMessage = options.unique?.[error.meta.target.join('_')]
          apiClientErrorCode = 'CONFLICT'
        }

        break
      }
      case 'P2025': {
        if (isDbErrorMetaWithCause(error.meta)) {
          if (error.meta.cause === 'Record to delete does not exist.' && options.delete) {
            apiClientErrorMessage = options.delete
            apiClientErrorCode = 'NOT_FOUND'
          } else if (error.meta.cause === 'Record to update not found.' && options.update) {
            apiClientErrorMessage = options.update
            apiClientErrorCode = 'NOT_FOUND'
          } else if (dbCreateManyErrorRegExp.test(error.meta.cause) && options.createMany) {
            apiClientErrorMessage = options.createMany
            apiClientErrorCode = 'NOT_FOUND'
          }
        }

        break
      }
    }
  }

  throw new TRPCError({
    cause: error,
    code: apiClientErrorCode ?? 'BAD_REQUEST',
    message: apiClientErrorMessage ?? API_ERROR_UNKNOWN,
  })
}

function isDbErrorMetaWithTarget(meta: unknown): meta is DbErrorMetaWithTarget {
  return meta !== undefined && Array.isArray((meta as DbErrorMetaWithTarget).target)
}

function isDbErrorMetaWithCause(meta: unknown): meta is DbErrorMetaWithCause {
  return meta !== undefined && typeof (meta as DbErrorMetaWithCause).cause === 'string'
}

// Multi-column constraints should be identified using a string being an underscore separated list of columns.
interface DbErrorHandlerOptions {
  createMany?: string
  delete?: string
  unique?: Record<string, string>
  update?: string
}

interface DbErrorMetaWithTarget {
  target: string[]
}

interface DbErrorMetaWithCause {
  cause: string
}
