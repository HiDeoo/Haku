import { faker } from '@faker-js/faker'
import cuid from 'cuid'
import multipartParser from 'lambda-multipart-parser'
import { assert, describe, expect, test, vi } from 'vitest'

import { API_ERROR_IMAGE_REFERENCE_DOES_NOT_EXIST, API_ERROR_IMAGE_UPLOAD_UNKNOWN } from 'constants/error'
import { HttpMethod } from 'constants/http'
import {
  IMAGE_DEFAULT_FORMAT,
  IMAGE_MAX_SIZE_IN_MEGABYTES,
  IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS,
  IMAGE_SUPPORTED_TYPES,
} from 'constants/image'
import { isNotEmpty } from 'libs/array'
import { CLOUDINARY_BASE_DELIVERY_URL, getCloudinaryApiUrl } from 'libs/cloudinary'
import { getBytesFromMegaBytes } from 'libs/math'
import { getTestUser, testApiRoute } from 'tests/api'
import { createTestNote, createTestTodo } from 'tests/api/db'
import { rest, server } from 'tests/api/mocks/http'

describe('image', () => {
  describe('add', () => {
    test('should not upload an image larger than the limit', () =>
      testApiRoute(async ({ caller }) => {
        const { filename, image } = await getFakeImage({
          sizeInBytes: getBytesFromMegaBytes(IMAGE_MAX_SIZE_IN_MEGABYTES) + 1,
        })

        await expect(() => caller.image.add({ filename, image, referenceId: cuid() })).rejects.toThrow()
      }))

    test('should not upload an image with an invalid reference ID', () =>
      testApiRoute(async ({ caller }) => {
        const { filename, image } = await getFakeImage()

        await expect(() => caller.image.add({ filename, image, referenceId: cuid() })).rejects.toThrow(
          API_ERROR_IMAGE_REFERENCE_DOES_NOT_EXIST
        )
      }))

    test('should not upload an image with a note reference ID not owned by the current user', () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestNote({ userId: getTestUser('1').userId })

        const { filename, image } = await getFakeImage()

        await expect(() => caller.image.add({ filename, image, referenceId: id })).rejects.toThrow(
          API_ERROR_IMAGE_REFERENCE_DOES_NOT_EXIST
        )
      }))

    test('should not upload an image with a todo reference ID not owned by the current user', () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestTodo({ userId: getTestUser('1').userId })

        const { filename, image } = await getFakeImage()

        await expect(() => caller.image.add({ filename, image, referenceId: id })).rejects.toThrow(
          API_ERROR_IMAGE_REFERENCE_DOES_NOT_EXIST
        )
      }))

    test('should not upload a file with an unsupported type', () =>
      testApiRoute(async ({ caller }) => {
        const { filename, image, referenceId } = await getFakeImage({ extension: 'bmp' })

        await expect(() => caller.image.add({ filename, image, referenceId })).rejects.toThrow()
      }))

    test.each(IMAGE_SUPPORTED_TYPES)('should upload an %s file', async (type) =>
      testApiRoute(async ({ caller }) => {
        const { filename, image, referenceId } = await getFakeImage({ extension: type.split('/')[1] })

        const res = await caller.image.add({ filename, image, referenceId })

        expect(res).toBeDefined()
      })
    )

    test('should return and log a proper error if the upload fails for unknown reasons', () =>
      testApiRoute(async ({ caller }) => {
        server.use(rest.post(getCloudinaryApiUrl('/image/upload'), (_req, res, ctx) => res.once(ctx.status(500))))

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

        const { filename, image, referenceId } = await getFakeImage()

        await expect(() => caller.image.add({ filename, image, referenceId })).rejects.toThrow(
          API_ERROR_IMAGE_UPLOAD_UNKNOWN
        )

        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
      }))

    test('should upload an image with a todo reference ID owned by the current user', () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestTodo()
        const { filename, image } = await getFakeImage()

        const res = await caller.image.add({ filename, image, referenceId: id })

        expect(res).toBeDefined()
      }))

    test('should upload an image with a note reference ID owned by the current user', () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestNote()
        const { filename, image } = await getFakeImage()

        const res = await caller.image.add({ filename, image, referenceId: id })

        expect(res).toBeDefined()
      }))

    test('should upload an image to Cloudinary', () =>
      testApiRoute(async ({ caller }) => {
        const uploadUrl = getCloudinaryApiUrl('/image/upload')

        const { id } = await createTestNote()

        const extension = 'png'
        const { filename, image } = await getFakeImage({ extension })

        const fetchSpy = vi.spyOn(global, 'fetch')

        server.use(
          rest.post(uploadUrl, async (req) => {
            const formData = await multipartParser.parse({
              body: await req.text(),
              headers: { 'Content-Type': req.headers.get('Content-Type') },
            })

            expect(formData.files.length).toBe(1)
            expect(formData.files[0]?.content).toBeInstanceOf(Buffer)
            expect(formData.files[0]?.contentType).toBe(`image/${extension}`)
            expect(formData.files[0]?.fieldname).toBe('file')

            expect(formData['api_key']).toBe(process.env.CLOUDINARY_API_KEY)
            expect(formData['folder']).toBe(getTestUser().userId)
            expect(formData['type']).toBe('private')
            expect(formData['tags']).toBe(id)
            expect(typeof formData['timestamp']).toBe('string')
          })
        )

        const res = await caller.image.add({ filename, image, referenceId: id })

        const cloudinaryApiReqIndex = fetchSpy.mock.calls.findIndex(([callUrl]) => callUrl === uploadUrl)

        const cloudinaryApiReq = fetchSpy.mock.calls[cloudinaryApiReqIndex]
        assert(cloudinaryApiReq)

        const [cloudinaryApiCallUrl, cloudinaryApiCallOptions] = cloudinaryApiReq

        expect(cloudinaryApiCallUrl).toBe(uploadUrl)
        expect(cloudinaryApiCallOptions?.method).toBe(HttpMethod.POST)

        expect(isSignedImageUrlWithTransforms(res.original, [])).toBe(true)

        expect(typeof res.responsive).toBe('object')
        expect(isNotEmpty(Object.keys(res.responsive))).toBe(true)

        expect(typeof res.height).toBe('number')
        expect(typeof res.width).toBe('number')

        expect(res.name).toBe(filename.split('.')[0])

        expect(res.placeholder).toMatch(new RegExp(`^data:image/${IMAGE_DEFAULT_FORMAT};base64,`))

        fetchSpy.mockRestore()
      }))

    test('should return the responsive URL for an image with a width smaller than the responsive breakpoints', () =>
      testApiRoute(async ({ caller }) => {
        const width = 200

        const { filename, image, referenceId } = await getFakeImage({ width })

        const res = await caller.image.add({ filename, image, referenceId })

        expect(Object.keys(res.responsive).length).toBe(1)

        expect(isSignedImageUrlWithTransforms(res.responsive[width], [`w_${width}`])).toBe(true)
      }))

    test('should return the responsive URLs for an image with a width in the responsive breakpoints', () =>
      testApiRoute(async ({ caller }) => {
        const width = 999

        const { filename, image, referenceId } = await getFakeImage({ width })

        const res = await caller.image.add({ filename, image, referenceId })

        const expectedWidths = getResponsiveWidths(width)

        expect(Object.keys(res.responsive).length).toBe(expectedWidths.length + 1)

        for (const expectedWidth of expectedWidths) {
          expect(isSignedImageUrlWithTransforms(res.responsive[expectedWidth], [`w_${expectedWidth}`])).toBe(true)
        }

        expect(isSignedImageUrlWithTransforms(res.responsive[width], [`w_${width}`])).toBe(true)
      }))

    test('should return the responsive URLs for an image with a width of a responsive breakpoint', () =>
      testApiRoute(async ({ caller }) => {
        const width = IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS[3]

        const { filename, image, referenceId } = await getFakeImage({ width })

        const res = await caller.image.add({ filename, image, referenceId })

        const expectedWidths = getResponsiveWidths(width)

        expect(Object.keys(res.responsive).length).toBe(expectedWidths.length)

        for (const expectedWidth of expectedWidths) {
          expect(isSignedImageUrlWithTransforms(res.responsive[expectedWidth], [`w_${expectedWidth}`])).toBe(true)
        }

        expect(isSignedImageUrlWithTransforms(res.responsive[width], [`w_${width}`])).toBe(true)
      }))

    test('should return the responsive URLs for an image with a width larger than the responsive breakpoints', () =>
      testApiRoute(async ({ caller }) => {
        const width = 3000

        const { filename, image, referenceId } = await getFakeImage({ width })

        const res = await caller.image.add({ filename, image, referenceId })

        const expectedWidths = getResponsiveWidths(width)

        expect(Object.keys(res.responsive).length).toBe(expectedWidths.length + 1)

        for (const expectedWidth of expectedWidths) {
          expect(isSignedImageUrlWithTransforms(res.responsive[expectedWidth], [`w_${expectedWidth}`])).toBe(true)
        }

        expect(isSignedImageUrlWithTransforms(res.responsive[width], [`w_${width}`])).toBe(true)
      }))

    test('should return a progressive JPEG for the original image when using JPEG image', () =>
      testApiRoute(async ({ caller }) => {
        const { filename, image, referenceId } = await getFakeImage({ extension: 'jpg' })

        const res = await caller.image.add({ filename, image, referenceId })

        expect(isSignedImageUrlWithTransforms(res.original, ['fl_progressive'], true)).toBe(true)
      }))

    test('should not return a progressive JPEG for the original image when not using a JPEG image', () =>
      testApiRoute(async ({ caller }) => {
        const { filename, image, referenceId } = await getFakeImage({ extension: 'png' })

        const res = await caller.image.add({ filename, image, referenceId })

        expect(isSignedImageUrlWithTransforms(res.original, [])).toBe(true)
        expect(isSignedImageUrlWithTransforms(res.original, ['pr-true'])).toBe(false)
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

async function getFakeImage(options?: FakeImageOptions) {
  const extension = options?.extension ?? 'png'

  const dataUriPrefix = `data:image/${extension};base64,`
  const base64Image = fakeBase64Images[`image/${extension === 'jpeg' ? 'jpg' : extension}`]

  if (!base64Image) {
    throw new Error('Unsupported image extension.')
  }

  const { id } = await createTestNote()

  return {
    filename: `${faker.random.words().toLowerCase().replace(/\W/g, '-')}${
      options?.width ? `_${options.width}` : ''
    }.${extension}`,
    image:
      dataUriPrefix +
      base64Image.repeat(
        options?.sizeInBytes ? Math.ceil(options.sizeInBytes / Buffer.from(base64Image, 'base64').length) : 1
      ),
    referenceId: id,
  }
}

const fakeBase64Images: Record<string, string> = {
  'image/webp': 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
  'image/gif': 'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
  'image/png': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII',
  'image/bmp':
    'Qk1xAAAAAAAAAHsAAABsAAAAAQAAAAEAAAABACAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAD/AAD/AAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQ==',
  'image/jpg':
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAJgABAAAAAAAAAAAAAAAAAAAAAxABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAAPwBH/9k',
}

function getResponsiveWidths(width: number): number[] {
  return IMAGE_RESPONSIVE_BREAKPOINTS_IN_PIXELS.filter((responsiveWidth) => responsiveWidth <= width)
}

interface FakeImageOptions {
  extension?: string
  sizeInBytes?: number
  width?: number
}
