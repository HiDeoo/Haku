import assert from 'assert'

import cuid from 'cuid'
import multipartParser from 'lambda-multipart-parser'
import { rest } from 'msw'

import { IMAGE_KIT_UPLOAD_URL } from 'libs/imageKit'

const handlers = [
  rest.post(IMAGE_KIT_UPLOAD_URL, async (req, res, ctx) => {
    const formData = await multipartParser.parse({
      body: req.body,
      headers: { 'Content-Type': req.headers.get('Content-Type') },
    })

    assert(typeof formData.fileName === 'string')

    const [filename, extension] = formData.fileName.split('.')

    const name = `${filename}_${cuid().substring(0, 5)}.${extension}`
    const filePath = `/${formData.folder}/${name}`

    const width = parseInt(filename?.split('_')[1] ?? '800', 10)

    return res(
      ctx.status(200),
      ctx.json({
        fileId: cuid(),
        filePath,
        fileType: 'image',
        height: 200,
        isPrivateFile: formData.isPrivateFile === 'true',
        name,
        size: 23957,
        thumbnailUrl: `${process.env.IMAGEKIT_URL_ENDPOINT}/tr:n-media_library_thumbnail${filePath}`,
        url: `${process.env.IMAGEKIT_URL_ENDPOINT}${filePath}`,
        width,
      })
    )
  }),
]

export default handlers
