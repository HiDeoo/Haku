import assert from 'assert'

import cuid from 'cuid'
import multipartParser from 'lambda-multipart-parser'
import { rest } from 'msw'

import { IMAGE_DEFAULT_FORMAT } from 'constants/image'
import { CLOUDINARY_BASE_API_URL, CLOUDINARY_BASE_DELIVERY_URL } from 'libs/cloudinary'

export const cloudinaryHandlers = [
  rest.post(`${CLOUDINARY_BASE_API_URL}/${process.env.CLOUDINARY_CLOUD_NAME}/*`, async (req, res, ctx) => {
    const formData = await multipartParser.parse({
      body: await req.text(),
      headers: { 'Content-Type': req.headers.get('Content-Type') },
    })

    assert(formData.files[0] !== undefined, 'Missing file to upload in form data.')

    const [filename, extension] = formData.files[0].filename.split('.')

    const folder = formData['folder'] ?? ''
    const publicId = `${folder}/${cuid()}`
    const signature = cuid().slice(0, 8)
    const version = cuid()

    const url = `${CLOUDINARY_BASE_DELIVERY_URL}/${process.env.CLOUDINARY_CLOUD_NAME}/image/private/s--${signature}--/v${version}/${publicId}`

    const width = Number(filename?.split('_')[1] ?? '800')

    return res(
      ctx.status(200),
      ctx.json({
        api_key: cuid(),
        asset_id: cuid(),
        bytes: 23_957,
        created_at: new Date(),
        etag: cuid(),
        folder,
        format: extension,
        height: 200,
        placeholder: false,
        public_id: `${folder}/${cuid()}`,
        resource_type: 'image',
        secure_url: url,
        signature: cuid(),
        type: 'private',
        url: url.replace(/^http/, 'https'),
        version_id: cuid(),
        version,
        width,
      })
    )
  }),
  rest.delete(`${CLOUDINARY_BASE_API_URL}/${process.env.CLOUDINARY_CLOUD_NAME}/*`, async (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        deleted: {},
        partial: false,
      })
    )
  }),
  rest.get(`${CLOUDINARY_BASE_DELIVERY_URL}/${process.env.CLOUDINARY_CLOUD_NAME}/*`, (_req, res, ctx) => {
    const image = Buffer.alloc(10, '.')

    return res(
      ctx.set('Content-Length', image.byteLength.toString()),
      ctx.set('Content-Type', `image/${IMAGE_DEFAULT_FORMAT}`),
      ctx.body(image)
    )
  }),
]
