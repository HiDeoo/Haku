import assert from 'assert'

import faker from '@faker-js/faker'
import FormData from 'form-data'
import multipartParser from 'lambda-multipart-parser'
import StatusCode from 'status-code-enum'

import { HttpMethod } from 'constants/http'
import {
  IMAGE_DEFAULT_FORMAT,
  IMAGE_MAX_SIZE_IN_MEGABYTES,
  IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS,
  IMAGE_SUPPORTED_TYPES,
} from 'constants/image'
import {
  API_ERROR_IMAGE_REFERENCE_DOES_NOT_EXIST,
  API_ERROR_IMAGE_UPLOAD_UNKNOWN,
  type ApiErrorResponse,
} from 'libs/api/routes/errors'
import { CLOUDINARY_BASE_DELIVERY_URL, getCloudinaryApiUrl, type ImageData } from 'libs/cloudinary'
import { getBytesFromMegaBytes } from 'libs/math'
import * as index from 'pages/api/images'
import { getTestUser, testApiRoute, type TestApiRouterHandler } from 'tests/api'
import { createTestNote, createTestTodo } from 'tests/api/db'
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
        const { body } = await getFakeImageFormData({
          sizeInBytes: getBytesFromMegaBytes(IMAGE_MAX_SIZE_IN_MEGABYTES) + 1,
        })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.ClientErrorBadRequest)
      }))

    test('should not upload more than one image', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = await getFakeImageFormData()
        addFakeImageToFormData(body)

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.ClientErrorBadRequest)
      }))

    test('should not upload an image without a reference ID', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const body = new FormData()
        addFakeImageToFormData(body)

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.ClientErrorBadRequest)
      }))

    test('should not upload an image with an invalid reference ID', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = await getFakeImageFormData({ referenceId: 'invalidReferenceId' })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.ClientErrorBadRequest)
      }))

    test('should not upload an image with a note reference ID not owned by the current user', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id } = await createTestNote({ userId: getTestUser('1').userId })
        const { body } = await getFakeImageFormData({ referenceId: id })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_IMAGE_REFERENCE_DOES_NOT_EXIST)
      }))

    test('should not upload an image with a todo reference ID not owned by the current user', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id } = await createTestTodo({ userId: getTestUser('1').userId })
        const { body } = await getFakeImageFormData({ referenceId: id })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_IMAGE_REFERENCE_DOES_NOT_EXIST)
      }))

    test('should not upload a file with an unsupported type', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = await getFakeImageFormData({ extension: 'txt' })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.ClientErrorBadRequest)
      }))

    test('should return and log a proper error if the upload fails for unknown reasons', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = await getFakeImageFormData()

        server.use(rest.post(getCloudinaryApiUrl('/image/upload'), (_req, res, ctx) => res.once(ctx.status(500))))

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

    test.each(IMAGE_SUPPORTED_TYPES)('should upload an %s file', async (type) =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = await getFakeImageFormData({ extension: type.split('/')[1] })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.SuccessOK)
      })
    )

    test('should upload an image with a todo reference ID owned by the current user', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id } = await createTestTodo()
        const { body } = await getFakeImageFormData({ referenceId: id })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.SuccessOK)
      }))

    test('should upload an image with a note reference ID owned by the current user', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id } = await createTestNote()
        const { body } = await getFakeImageFormData({ referenceId: id })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.SuccessOK)
      }))

    test('should upload an image to Cloudinary', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const uploadUrl = getCloudinaryApiUrl('/image/upload')

        const { id } = await createTestNote()
        const { body, extension, filename } = await getFakeImageFormData({ referenceId: id })

        const fetchSpy = jest.spyOn(global, 'fetch')

        server.use(
          rest.post(uploadUrl, async (req) => {
            const formData = await multipartParser.parse({
              body: req.body,
              headers: { 'Content-Type': req.headers.get('Content-Type') },
            })

            expect(formData.files.length).toBe(1)
            expect(formData.files[0]?.content).toBeInstanceOf(Buffer)
            expect(formData.files[0]?.contentType).toBe(`image/${extension}`)
            expect(formData.files[0]?.fieldname).toBe('file')

            expect(formData.api_key).toBe(process.env.CLOUDINARY_API_KEY)
            expect(formData.folder).toBe(getTestUser().userId)
            expect(formData.type).toBe('private')
            expect(formData.tags).toBe(id)
            expect(typeof formData.timestamp).toBe('string')
          })
        )

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        const cloudinaryApiReqIndex = fetchSpy.mock.calls.findIndex(([callUrl]) => callUrl === uploadUrl)

        const cloudinaryApiReq = fetchSpy.mock.calls[cloudinaryApiReqIndex]
        assert(cloudinaryApiReq)

        const [cloudinaryApiCallUrl, cloudinaryApiCallOptions] = cloudinaryApiReq

        expect(cloudinaryApiCallUrl).toBe(uploadUrl)
        expect(cloudinaryApiCallOptions?.method).toBe(HttpMethod.POST)

        expect(res.status).toBe(StatusCode.SuccessOK)

        const json = await res.json<ImageData>()

        expect(isSignedImageUrlWithTransforms(json.original, [])).toBe(true)

        expect(typeof json.responsive).toBe('object')
        expect(Object.keys(json.responsive).length).toBeGreaterThan(0)

        expect(typeof json.height).toBe('number')
        expect(typeof json.width).toBe('number')

        expect(json.name).toBe(filename.split('.')[0])

        expect(json.placeholder).toMatch(new RegExp(`^data:image/${IMAGE_DEFAULT_FORMAT};base64,`))

        fetchSpy.mockRestore()
      }))

    test('should return the responsive URL for an image with a width smaller than the responsive breakpoints', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const width = 200

        const { body } = await getFakeImageFormData({ width })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })
        const json = await res.json<ImageData>()

        expect(Object.keys(json.responsive).length).toBe(1)

        expect(isSignedImageUrlWithTransforms(json.responsive[width], [`w_${width}`])).toBe(true)
      }))

    test('should return the responsive URLs for an image with a width in the responsive breakpoints', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const width = 999

        const { body } = await getFakeImageFormData({ width })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })
        const json = await res.json<ImageData>()

        const expectedWidths = getResponsiveWidths(width)

        expect(Object.keys(json.responsive).length).toBe(expectedWidths.length + 1)

        for (const expectedWidth of expectedWidths) {
          expect(isSignedImageUrlWithTransforms(json.responsive[expectedWidth], [`w_${expectedWidth}`])).toBe(true)
        }

        expect(isSignedImageUrlWithTransforms(json.responsive[width], [`w_${width}`])).toBe(true)
      }))

    test('should return the responsive URLs for an image with a width of a responsive breakpoint', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const width = IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS[3]

        const { body } = await getFakeImageFormData({ width })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })
        const json = await res.json<ImageData>()

        const expectedWidths = getResponsiveWidths(width)

        expect(Object.keys(json.responsive).length).toBe(expectedWidths.length)

        for (const expectedWidth of expectedWidths) {
          expect(isSignedImageUrlWithTransforms(json.responsive[expectedWidth], [`w_${expectedWidth}`])).toBe(true)
        }

        expect(isSignedImageUrlWithTransforms(json.responsive[width], [`w_${width}`])).toBe(true)
      }))

    test('should return the responsive URLs for an image with a width larger than the responsive breakpoints', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const width = 3000

        const { body } = await getFakeImageFormData({ width })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })
        const json = await res.json<ImageData>()

        const expectedWidths = getResponsiveWidths(width)

        expect(Object.keys(json.responsive).length).toBe(expectedWidths.length + 1)

        for (const expectedWidth of expectedWidths) {
          expect(isSignedImageUrlWithTransforms(json.responsive[expectedWidth], [`w_${expectedWidth}`])).toBe(true)
        }

        expect(isSignedImageUrlWithTransforms(json.responsive[width], [`w_${width}`])).toBe(true)
      }))

    test('should return a progressive JPEG for the original image when using JPEG image', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = await getFakeImageFormData({ extension: 'jpg' })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })
        const json = await res.json<ImageData>()

        expect(isSignedImageUrlWithTransforms(json.original, ['fl_progressive'], true)).toBe(true)
      }))

    test('should not return a progressive JPEG for the original image when not using a JPEG image', async () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { body } = await getFakeImageFormData({ extension: 'png' })

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })
        const json = await res.json<ImageData>()

        expect(isSignedImageUrlWithTransforms(json.original, [])).toBe(true)
        expect(isSignedImageUrlWithTransforms(json.original, ['pr-true'])).toBe(false)
      }))
  })
})

function isSignedImageUrlWithTransforms(url: string | undefined, transforms: string[], isOriginal = false): boolean {
  if (
    typeof url !== 'string' ||
    !url.startsWith(`${CLOUDINARY_BASE_DELIVERY_URL}/${process.env.CLOUDINARY_CLOUD_NAME}/image/private/s--`)
  ) {
    return false
  }

  if (transforms.length > 0 && !isOriginal) {
    transforms.push(`f_${IMAGE_DEFAULT_FORMAT}`)
  }

  return transforms.every((transform) => url.match(new RegExp(`${transform}[/,]`)))
}

async function getFakeImageFormData(options?: FakeImageFormDataOptions) {
  const formData = new FormData()

  formData.append('referenceId', options?.referenceId ?? (await createTestNote({ name: 'note_0' })).id)

  const { extension, filename } = addFakeImageToFormData(formData, options)

  return { body: formData, extension, filename }
}

function addFakeImageToFormData(
  formData: FormData,
  { extension = 'png', sizeInBytes = 10, width }: FakeImageFormDataOptions = {}
) {
  const filename = `${faker.random.words().toLowerCase().replace(/\W/g, '-')}${width ? `_${width}` : ''}.${extension}`

  formData.append('file', Buffer.alloc(sizeInBytes, '.'), filename)

  return { extension, filename }
}

function getResponsiveWidths(width: number): number[] {
  return IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS.filter((responsiveWidth) => responsiveWidth <= width)
}

interface FakeImageFormDataOptions {
  extension?: string
  referenceId?: string
  width?: number
  sizeInBytes?: number
}
