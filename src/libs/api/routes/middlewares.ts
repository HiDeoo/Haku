import multer, { type Options as MulterOptions } from 'multer'
import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import StatusCode from 'status-code-enum'

import { IMAGE_SUPPORTED_TYPES } from 'constants/image'
import { z } from 'libs/validation'

const fileMemoryStorage = multer.memoryStorage()

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
      req.query = querySchema?.parse(parseJson(req.query)) ?? {}

      return handler(req, res)
    } catch (error) {
      return res.status(StatusCode.ClientErrorBadRequest).end()
    }
  }
}

export function withFormDataValidation<
  TData extends ApiRequestValidationData,
  TSchema extends ApiRequestValidationSchema,
  TResponseType
>(
  handler: ApiHandlerWithFormDataValidation<TData, TResponseType>,
  { bodySchema, fileFilter, maxFileSizeInBytes }: FormDataValidationOptions<TSchema>
) {
  return async (req: NextApiRequest, res: NextApiResponse<TResponseType>) => {
    try {
      const withFile = typeof maxFileSizeInBytes !== 'undefined'

      await new Promise<void>((resolve, reject) => {
        const instance = multer({
          fileFilter,
          limits: {
            fields: bodySchema ? Infinity : 0,
            files: withFile ? 1 : undefined,
            fileSize: maxFileSizeInBytes,
          },
          storage: fileMemoryStorage,
        })

        if (withFile) {
          instance.single('file')(req, res, (err) => {
            err ? reject(err) : resolve()
          })
        } else {
          instance.none()(req, res, (err) => {
            err ? reject(err) : resolve()
          })
        }
      })

      if (withFile && 'file' in req === false) {
        throw new Error('Missing request file.')
      }

      req.body = bodySchema?.parse(parseJson(req.body))

      return handler(req as ValidatedApiFormDataRequest<TData>, res)
    } catch (error) {
      return res.status(StatusCode.ClientErrorBadRequest).end()
    }
  }
}
export const imageFileFilter: FileFilter = (_req, file, cb) => {
  cb(null, typeof file.mimetype === 'string' && IMAGE_SUPPORTED_TYPES.includes(file.mimetype))
}

function parseJson(json: unknown) {
  return typeof json === 'string' ? JSON.parse(json) : json
}

type ApiRequestValidationSchema = { body?: z.ZodType<unknown>; query?: z.ZodType<Record<string, string | string[]>> }
export type ApiRequestValidationData = { body?: unknown; query?: unknown }

export type ValidatedApiRequest<TSchema extends ApiRequestValidationData> = Omit<NextApiRequest, 'body' | 'query'> & {
  body: TSchema['body']
  query: TSchema['query']
}

export type ValidatedApiFormDataRequest<TSchema extends ApiRequestValidationData & { file?: boolean }> =
  ValidatedApiRequest<TSchema> & {
    file: TSchema['file'] extends true ? ParsedFile : undefined
  }

export type ParsedFile = NonNullable<Express.Request['file']>
export type FileFilter = MulterOptions['fileFilter']

type ApiHandlerWithValidation<TSchema extends ApiRequestValidationData, TResponseType> = (
  req: ValidatedApiRequest<TSchema>,
  res: NextApiResponse<TResponseType>
) => void | Promise<void>

type ApiHandlerWithFormDataValidation<TSchema extends ApiRequestValidationData, TResponseType> = (
  req: ValidatedApiFormDataRequest<TSchema>,
  res: NextApiResponse<TResponseType>
) => void | Promise<void>

interface FormDataValidationOptions<TSchema extends ApiRequestValidationSchema> {
  maxFileSizeInBytes?: number
  fileFilter?: FileFilter
  bodySchema?: TSchema['body']
}
