import crypto from 'crypto'

import FormData from 'form-data'
import { StatusCode } from 'status-code-enum'

import { HttpMethod } from 'constants/http'
import { IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS } from 'constants/image'
import { ApiError, API_ERROR_IMAGE_UPLOAD_UNKNOWN } from 'libs/api/routes/errors'
import { ParsedFile } from 'libs/api/routes/middlewares'

export const IMAGE_KIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload'

export interface ImageData {
  original: string
  responsive: Record<number, string>
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

    return getImageKitSignedUrls(json)
  } catch (error) {
    console.error('Unable to upload image to ImageKit:', isImageKitError(json) ? json.message : error)

    throw new ApiError(API_ERROR_IMAGE_UPLOAD_UNKNOWN, StatusCode.ServerErrorServiceUnavailable)
  }
}

function getImageKitSignedUrls(file: ImageKitFile): ImageData {
  const original = getImageKitSignedUrl(file.filePath, ['orig-true'])

  const responsive: ImageData['responsive'] = {
    [file.width]: getImageKitSignedUrl(file.filePath, [`w-${file.width}`]),
  }

  for (const breakpoint of IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS) {
    if (breakpoint < file.width) {
      responsive[breakpoint] = getImageKitSignedUrl(file.filePath, [`w-${breakpoint}`])
    }
  }

  return { original, responsive }
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
