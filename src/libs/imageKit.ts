import crypto from 'crypto'

import FormData from 'form-data'
import { StatusCode } from 'status-code-enum'

import { HttpMethod } from 'constants/http'
import { IMAGE_DEFAULT_FORMAT, IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS } from 'constants/image'
import { ApiError, API_ERROR_IMAGE_UPLOAD_UNKNOWN } from 'libs/api/routes/errors'
import { ParsedFile } from 'libs/api/routes/middlewares'
import { isJpegMimeType } from 'libs/media'

export const IMAGE_KIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload'

export interface ImageData {
  height: number
  name: string
  original: string
  placeholder: string
  responsive: Record<number, string>
  width: number
}

const imageExpiryTimestamp = 9999999999

export async function uploadToImageKit(userId: UserId, image: ParsedFile): Promise<ImageData> {
  const formData = new FormData()

  formData.append('file', image.buffer, image.originalname)
  formData.append('fileName', image.originalname)
  formData.append('folder', userId)
  formData.append('isPrivateFile', 'true')
  formData.append('overwriteFile', 'false')
  formData.append('responseFields', 'isPrivateFile')
  formData.append('useUniqueFileName', 'true')

  let json: ImageKitFile | ImageKitError | undefined

  try {
    const res = await fetch(IMAGE_KIT_UPLOAD_URL, {
      // https://github.com/form-data/form-data/issues/513
      body: formData as unknown as RequestInit['body'],
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.IMAGEKIT_PRIVATE_API_KEY.concat(':')).toString('base64')}`,
      },
      method: HttpMethod.POST,
    })

    json = await res.json()

    if (!res.ok || !json || isImageKitError(json)) {
      throw new Error('Unable to upload image to ImageKit.')
    }

    return getImageKitSignedUrls(json, image.originalname, isJpegMimeType(image.mimetype))
  } catch (error) {
    console.error('Unable to upload image to ImageKit:', isImageKitError(json) ? json.message : error)

    throw new ApiError(API_ERROR_IMAGE_UPLOAD_UNKNOWN, StatusCode.ServerErrorServiceUnavailable)
  }
}

async function getImageKitSignedUrls(file: ImageKitFile, name: string, isJpeg: boolean): Promise<ImageData> {
  const format = `f-${IMAGE_DEFAULT_FORMAT}`

  const res = await fetch(
    getImageKitSignedUrl(file.filePath, [format, 'q-10', 'bl-2', file.width < 100 ? `w-${file.width}` : 'w-100'])
  )
  const buffer = Buffer.from(await res.arrayBuffer())
  const placeholder = 'data:' + res.headers.get('Content-Type') + ';base64,' + buffer.toString('base64')

  const originalTransforms = ['orig-true']

  if (isJpeg) {
    originalTransforms.push('pr-true')
  }

  const original = getImageKitSignedUrl(file.filePath, originalTransforms)

  const responsive: ImageData['responsive'] = {
    [file.width]: getImageKitSignedUrl(file.filePath, [format, `w-${file.width}`]),
  }

  for (const breakpoint of IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS) {
    if (breakpoint < file.width) {
      responsive[breakpoint] = getImageKitSignedUrl(file.filePath, [format, `w-${breakpoint}`])
    }
  }

  return { height: file.height, name, original, placeholder, responsive, width: file.width }
}

function getImageKitSignedUrl(filePath: string, transforms: string[]): string {
  const imagePath = `tr:${transforms.join(',')}${filePath}`
  const imageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/${imagePath}`

  const imageSignature = crypto
    .createHmac('sha1', process.env.IMAGEKIT_PRIVATE_API_KEY)
    .update(imagePath + imageExpiryTimestamp)
    .digest('hex')

  return `${imageUrl}?ik-s=${imageSignature}`
}

function isImageKitError(data: ImageKitFile | ImageKitError | undefined): data is ImageKitError {
  return typeof data === 'object' && typeof (data as ImageKitError).message === 'string'
}

interface ImageKitFile {
  fileId: string
  filePath: string
  fileType: 'image' | 'non-image'
  height: number
  isPrivateFile: boolean
  name: string
  size: number
  thumbnailUrl: string
  url: string
  width: number
}

interface ImageKitError {
  help: string
  message: string
}
