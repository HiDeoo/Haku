import crypto from 'crypto'
import path from 'path'

import { TRPCError } from '@trpc/server'
import FormData from 'form-data'

import {
  API_ERROR_IMAGE_DELETE_UNKNOWN,
  API_ERROR_IMAGE_REFERENCE_DOES_NOT_EXIST,
  API_ERROR_IMAGE_UPLOAD_UNKNOWN,
} from 'constants/error'
import { HttpMethod } from 'constants/http'
import { IMAGE_DEFAULT_FORMAT, IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS } from 'constants/image'
import { isNotEmpty, sortTupleArrayAlphabetically } from 'libs/array'
import { prisma } from 'libs/db'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { isGifExtension, isJpegExtension } from 'libs/image'

export interface ImageData {
  height: number
  name: string
  original: string
  placeholder: string
  responsive: Record<number, string>
  width: number
}

export const CLOUDINARY_BASE_API_URL = 'https://api.cloudinary.com/v1_1'
export const CLOUDINARY_BASE_DELIVERY_URL = 'https://res.cloudinary.com'

export async function uploadToCloudinary(
  userId: UserId,
  image: string,
  filename: string,
  referenceId: NoteMetadata['id'] | TodoMetadata['id']
): Promise<ImageData> {
  const [{ exists: referenceExists }] = await prisma.$queryRaw<[{ exists: boolean }]>`
SELECT EXISTS(
  SELECT 1 FROM "Note" WHERE "id" = ${referenceId} AND "userId" = ${userId}
  UNION
  SELECT 1 FROM "Todo" WHERE "id" = ${referenceId} AND "userId" = ${userId}
)`

  if (!referenceExists) {
    throw new TRPCError({ code: 'NOT_FOUND', message: API_ERROR_IMAGE_REFERENCE_DOES_NOT_EXIST })
  }

  const formData = new FormData()

  formData.append('file', image, filename)
  formData.append('api_key', process.env.CLOUDINARY_API_KEY)

  const parameters: [string, string][] = [
    ['folder', userId],
    ['type', 'private'],
    ['tags', referenceId],
    ['timestamp', Math.trunc(Date.now() / 1000).toString()],
  ]

  const sortedParameters = sortTupleArrayAlphabetically(parameters)
  const parametersStr = sortedParameters.map(([key, value]) => `${key}=${value}`).join('&')

  const signature = crypto
    .createHash('sha1')
    .update(parametersStr + process.env.CLOUDINARY_API_SECRET)
    .digest('hex')

  for (const [key, value] of sortedParameters) {
    formData.append(key, value)
  }

  formData.append('signature', signature)

  let json: CloudinaryFile | CloudinaryError | undefined

  try {
    const res = await fetch(getCloudinaryApiUrl('/image/upload'), {
      // https://github.com/form-data/form-data/issues/513
      body: formData as unknown as RequestInit['body'],
      method: HttpMethod.POST,
    })

    json = await res.json()

    if (!res.ok || !json || isCloudinaryError(json)) {
      throw new Error('Unable to upload image to Cloudinary.')
    }

    return await getImageData(json, path.parse(filename).name)
  } catch (error) {
    console.error('Unable to upload image to Cloudinary:', isCloudinaryError(json) ? json.error.message : error)

    throw new TRPCError({ code: 'CLIENT_CLOSED_REQUEST', message: API_ERROR_IMAGE_UPLOAD_UNKNOWN })
  }
}

export async function deleteFromCloudinaryByTag(tag: string): Promise<void> {
  let json: CloudinaryTagDeletion | CloudinaryError | undefined

  try {
    const res = await fetch(getCloudinaryApiUrl(`/resources/image/tags/${tag}`), {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`,
          'binary'
        ).toString('base64')}`,
      },
      method: HttpMethod.DELETE,
    })

    json = await res.json()

    if (!res.ok || !json || isCloudinaryError(json)) {
      throw new Error('Unable to delete images by tag from Cloudinary.')
    }
  } catch (error) {
    console.error(
      'Unable to delete images by tag from Cloudinary:',
      isCloudinaryError(json) ? json.error.message : error
    )

    throw new TRPCError({ code: 'CLIENT_CLOSED_REQUEST', message: API_ERROR_IMAGE_DELETE_UNKNOWN })
  }
}

export function getCloudinaryApiUrl(action: `/${string}`) {
  return `${CLOUDINARY_BASE_API_URL}/${process.env.CLOUDINARY_CLOUD_NAME}${action}`
}

async function getImageData(file: CloudinaryFile, name: string): Promise<ImageData> {
  const format = `f_${IMAGE_DEFAULT_FORMAT}`

  const placeholderTransforms = [format, 'q_20', 'e_blur:1000', file.width < 100 ? `w_${file.width}` : 'w_100']

  if (isGifExtension(file.format)) {
    placeholderTransforms.push('pg_1')
  }

  const res = await fetch(getCloudinarySignedUrl(file, placeholderTransforms))
  const buffer = Buffer.from(await res.arrayBuffer())
  const placeholder = 'data:' + res.headers.get('Content-Type') + ';base64,' + buffer.toString('base64')

  const original = getCloudinarySignedUrl(file, isJpegExtension(file.format) ? ['fl_progressive'] : [])

  const responsive: ImageData['responsive'] = {
    [file.width]: getCloudinarySignedUrl(file, [format, `w_${file.width}`]),
  }

  for (const breakpoint of IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS) {
    if (breakpoint < file.width) {
      responsive[breakpoint] = getCloudinarySignedUrl(file, [format, `w_${breakpoint}`])
    }
  }

  return { height: file.height, name, original, placeholder, responsive, width: file.width }
}

function getCloudinarySignedUrl(file: CloudinaryFile, transforms: string[]): string {
  let parameters = `v${file.version}/${file.public_id}`

  if (isNotEmpty(transforms)) {
    parameters = `${transforms.join(',')}/${parameters}`
  }

  // https://github.com/cloudinary/cloudinary_npm/blob/c6298a7d1f49b4a4045969d2cfec7cb30668a341/lib/utils/index.js#L791
  const signature = crypto
    .createHash('sha1')
    .update(parameters + process.env.CLOUDINARY_API_SECRET)
    .digest('base64')
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
    .slice(0, 8)

  return `${CLOUDINARY_BASE_DELIVERY_URL}/${process.env.CLOUDINARY_CLOUD_NAME}/image/private/s--${signature}--/${parameters}`
}

function isCloudinaryError(data: unknown): data is CloudinaryError {
  return (
    typeof data === 'object' &&
    typeof (data as CloudinaryError).error === 'object' &&
    typeof (data as CloudinaryError).error.message === 'string'
  )
}

interface CloudinaryFile {
  api_key: string
  asset_id: string
  bytes: number
  created_at: string
  etag: string
  folder: string
  format: string
  height: number
  placeholder: boolean
  public_id: string
  resource_type: 'image' | 'raw' | 'video'
  secure_url: string
  signature: string
  type: 'upload' | 'private' | 'authenticated'
  url: string
  version_id: string
  version: number
  width: number
}

interface CloudinaryTagDeletion {
  deleted: Record<string, 'deleted'>
  partial: boolean
}

interface CloudinaryError {
  error: {
    message: string
  }
}
