import assert from 'assert'

import faker from '@faker-js/faker'
import FormData from 'form-data'
import multipartParser from 'lambda-multipart-parser'
import StatusCode from 'status-code-enum'

import { HttpMethod } from 'constants/http'
import { IMAGE_MAX_SIZE_IN_MEGABYTES, IMAGE_SUPPORTED_TYPES } from 'constants/image'
import { API_ERROR_IMAGE_UPLOAD_UNKNOWN, type ApiErrorResponse } from 'libs/api/routes/errors'
import { IMAGE_KIT_UPLOAD_URL } from 'libs/imageKit'
import { getBytesFromMegaBytes } from 'libs/math'
import * as index from 'pages/api/images'
import { getTestUser, testApiRoute, type TestApiRouterHandler } from 'tests/api'
import { rest, server } from 'tests/api/mocks/http'

// We need to explicitely attach the route configuration to the route handler as `next-test-api-route-handler` does not
// attach it automatically and we need the body parser to be disabled for `multer` to work properly.
// https://github.com/vercel/next.js/blob/e969d226999bb0fcb52ecc203b359f3715ff69bf/packages/next/next-server/server/api-utils.ts#L39
const indexHandler: TestApiRouterHandler = index.default
indexHandler.config = index.config

describe('images', () => {
  describe('POST', () => {
    test('should not upload an image larger than the limit', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = getFakeImageFormData({ sizeInBytes: getBytesFromMegaBytes(IMAGE_MAX_SIZE_IN_MEGABYTES) + 1 })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.ClientErrorBadRequest)
      }))

    test('should not upload more than one image', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = getFakeImageFormData()
        addFakeImageToFormData(body)

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.ClientErrorBadRequest)
      }))

    test('should not upload an image contained in a FormData structure with non-file fields', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = getFakeImageFormData()
        body.append('a', 'b')

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.ClientErrorBadRequest)
      }))

    test('should not upload a file with an unsupported type', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = getFakeImageFormData({ extension: 'txt' })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.ClientErrorBadRequest)
      }))

    test.each(IMAGE_SUPPORTED_TYPES)('should upload an %s file', async (type) =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = getFakeImageFormData({ extension: type.split('/')[1] })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.SuccessOK)
      })
    )

    test('should return and log a proper error if the upload fails for unknown reasons', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = getFakeImageFormData()

        server.use(rest.post(IMAGE_KIT_UPLOAD_URL, (_req, res, ctx) => res.once(ctx.status(500))))

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ServerErrorServiceUnavailable)
        expect(json.error).toBe(API_ERROR_IMAGE_UPLOAD_UNKNOWN)

        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
      }))

    test('should upload an image to ImageKit', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body, extension, filename } = getFakeImageFormData()

        const fetchSpy = jest.spyOn(global, 'fetch')

        server.use(
          rest.post(IMAGE_KIT_UPLOAD_URL, async (req) => {
            const formData = await multipartParser.parse({
              body: req.body,
              headers: { 'Content-Type': req.headers.get('Content-Type') },
            })

            expect(formData.files.length).toBe(1)
            expect(formData.files[0]?.content).toBeInstanceOf(Buffer)
            expect(formData.files[0]?.contentType).toBe(`image/${extension}`)
            expect(formData.files[0]?.fieldname).toBe('file')

            expect(formData.fileName).toBe(filename)
            expect(formData.folder).toBe(getTestUser().userId)
            expect(formData.isPrivateFile).toBe('true')
            expect(formData.overwriteFile).toBe('false')
            expect(formData.useUniqueFileName).toBe('true')
          })
        )

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        const imageKitApiReqIndex = fetchSpy.mock.calls.findIndex(([callUrl]) => callUrl === IMAGE_KIT_UPLOAD_URL)

        const imageKitApiReq = fetchSpy.mock.calls[imageKitApiReqIndex]
        assert(imageKitApiReq)

        const [imageKitApiCallUrl, imageKitApiCallOptions] = imageKitApiReq

        expect(imageKitApiCallUrl).toBe(IMAGE_KIT_UPLOAD_URL)
        expect(imageKitApiCallOptions?.method).toBe(HttpMethod.POST)

        assert(typeof imageKitApiCallOptions?.headers === 'object')
        const headers = imageKitApiCallOptions.headers as Record<string, string>

        expect(headers.Authorization).toBe(
          `Basic ${Buffer.from(`${process.env.IMAGEKIT_PRIVATE_API_KEY}:`).toString('base64')}`
        )

        expect(res.status).toBe(StatusCode.SuccessOK)

        // TODO(HiDeoo) Test haku API response

        fetchSpy.mockRestore()
      }))
  })
})

function getFakeImageFormData(options?: FakeImageFormDataOptions) {
  const formData = new FormData()

  const { extension, filename } = addFakeImageToFormData(formData, options)

  return { body: formData, extension, filename }
}

function addFakeImageToFormData(
  formData: FormData,
  { extension = 'png', sizeInBytes = 10 }: FakeImageFormDataOptions = {}
) {
  const filename = faker.system.commonFileName(extension)

  formData.append('file', Buffer.alloc(sizeInBytes, '.'), filename)

  return { extension, filename }
}

interface FakeImageFormDataOptions {
  extension?: string
  sizeInBytes?: number
}
