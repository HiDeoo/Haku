import FormData from 'form-data'
import { StatusCode } from 'status-code-enum'

import { HttpMethod } from 'constants/http'
import { ApiError, API_ERROR_IMAGE_UPLOAD_UNKNOWN } from 'libs/api/routes/errors'
import { ParsedFile } from 'libs/api/routes/middlewares'

export const IMAGE_KIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload'

export async function uploadToImageKit(image: ParsedFile) {
  const formData = new FormData()

  formData.append('file', image.buffer, image.originalname)
  formData.append('fileName', image.originalname)

  const res = await fetch(IMAGE_KIT_UPLOAD_URL, {
    // https://github.com/form-data/form-data/issues/513
    body: formData as unknown as RequestInit['body'],
    headers: {
      Authorization: `Basic ${Buffer.from(process.env.IMAGEKIT_PRIVATE_API_KEY.concat(':')).toString('base64')}`,
    },
    method: HttpMethod.POST,
  })

  if (!res.ok) {
    // TODO(HiDeoo) Logging

    throw new ApiError(API_ERROR_IMAGE_UPLOAD_UNKNOWN, StatusCode.ServerErrorServiceUnavailable)
  }

  const json = await res.json()

  console.log('🚨 [imageKit.ts:14] json', json)
}
