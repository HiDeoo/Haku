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
      req.query = querySchema?.parse(parseJson(req.query)) as NextApiRequest['query']

      return handler(req, res)
    } catch (error) {
      return res.status(StatusCode.ClientErrorBadRequest).end()
    }
  }
}

export function withFile<TResponseType>(
  handler: ApiHandlerWithFile<TResponseType>,
  maxFileSizeInBytes: number,
  fileFilter?: FileFilter
) {
  return async (req: NextApiRequest | FileApiRequest, res: NextApiResponse<TResponseType>) => {
    try {
      await new Promise<void>((resolve, reject) => {
        multer({
          fileFilter,
          limits: {
            fields: 0,
            files: 1,
            fileSize: maxFileSizeInBytes,
          },
          storage: fileMemoryStorage,
        }).single('file')(req, res, (err) => {
          err ? reject(err) : resolve()
        })
      })

      if (!('file' in req)) {
        throw new Error('Missing request file.')
      }
    } catch (error) {
      return res.status(StatusCode.ClientErrorBadRequest).end()
    }

    return handler(req, res)
  }
}

export const imageFileFilter: FileFilter = (_req, file, cb) => {
  cb(null, typeof file.mimetype === 'string' && IMAGE_SUPPORTED_TYPES.includes(file.mimetype))
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

export type ParsedFile = NonNullable<Express.Request['file']>

export type FileApiRequest = NextApiRequest & {
  file: ParsedFile
}

export type FileFilter = MulterOptions['fileFilter']

type ApiHandlerWithValidation<TSchema extends ApiRequestValidationData, TResponseType> = (
  req: ValidatedApiRequest<TSchema>,
  res: NextApiResponse<TResponseType>
) => void | Promise<void>

type ApiHandlerWithFile<TResponseType> = (
  req: FileApiRequest,
  res: NextApiResponse<TResponseType>
) => void | Promise<void>
